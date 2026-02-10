# Web Scraping Architecture with Colly

## Overview

This document describes the scalable and configurable web scraping architecture for Precium, designed to automatically collect store data, product information, and pricing from various online sources. The system uses Colly (a fast and elegant scraping framework for Golang) along with cron job scheduling for automated data collection.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Scraper Design](#scraper-design)
4. [Configuration System](#configuration-system)
5. [Cron Job Scheduling](#cron-job-scheduling)
6. [Data Pipeline](#data-pipeline)
7. [Error Handling & Resilience](#error-handling--resilience)
8. [Scalability Considerations](#scalability-considerations)
9. [Implementation Guide](#implementation-guide)
10. [Monitoring & Logging](#monitoring--logging)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Scraping Orchestrator                     │
│  (Cron Jobs + Job Queue + Worker Pool)                      │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│   Scraper A   │      │   Scraper B   │
│  (Walmart)    │      │  (Target)     │
└───────┬───────┘      └───────┬───────┘
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────┐
        │  Data Processor  │
        │  (Parse, Clean)  │
        └────────┬─────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Data Validator  │
        │  & Deduplicator  │
        └────────┬─────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   PostgreSQL    │
        │  (via SQLC)     │
        └─────────────────┘
```

### Components

1. **Scraping Orchestrator**: Manages scraping jobs, schedules, and worker pools
2. **Scrapers**: Individual scraping modules per website (using Colly)
3. **Data Processor**: Parses and cleans scraped data
4. **Data Validator**: Validates and deduplicates data before storage
5. **Storage Layer**: PostgreSQL with SQLC for type-safe queries

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Scraping** | Colly | v2.1+ | Web scraping framework |
| **Scheduling** | gocron | v2.0+ | Cron job scheduler |
| **Queue** | Asynq | v0.24+ | Redis-backed job queue |
| **Parser** | goquery | v1.8+ | HTML parsing (jQuery-like) |
| **Validation** | go-validator | v10.0+ | Data validation |
| **Storage** | SQLC | Latest | Type-safe SQL queries |
| **Config** | Viper | v1.18+ | Configuration management |
| **Logging** | Zerolog | v1.32+ | Structured logging |

---

## Scraper Design

### Base Scraper Interface

```go
// pkg/scraper/scraper.go
package scraper

import (
    "context"
    "time"
)

// Scraper defines the interface for all scrapers
type Scraper interface {
    // Name returns the scraper identifier
    Name() string
    
    // Scrape executes the scraping job
    Scrape(ctx context.Context, params ScrapeParams) (*ScrapeResult, error)
    
    // Validate validates scraper configuration
    Validate() error
    
    // GetConfig returns scraper configuration
    GetConfig() *ScraperConfig
}

// ScrapeParams contains parameters for scraping
type ScrapeParams struct {
    StoreID    string
    Location   *Location
    Categories []string
    MaxPages   int
    Timeout    time.Duration
}

// ScrapeResult contains scraping results
type ScrapeResult struct {
    StoreData  *StoreData
    Products   []*Product
    Prices     []*Price
    Promotions []*Promotion
    Metadata   *ScrapeMetadata
}

// ScraperConfig holds scraper configuration
type ScraperConfig struct {
    Name           string
    BaseURL        string
    RateLimit      int           // requests per second
    UserAgent      string
    Headers        map[string]string
    Selectors      Selectors
    Enabled        bool
    Schedule       string        // cron expression
    MaxRetries     int
    RetryDelay     time.Duration
    Timeout        time.Duration
    ProxyEnabled   bool
    JavaScriptEnabled bool
}

// Selectors defines CSS/XPath selectors
type Selectors struct {
    ProductName   string
    ProductPrice  string
    ProductImage  string
    ProductURL    string
    Promotion     string
    StoreLocation string
    Pagination    string
}
```

### Colly-Based Scraper Implementation

```go
// internal/scraper/colly_scraper.go
package scraper

import (
    "context"
    "fmt"
    "time"
    
    "github.com/gocolly/colly/v2"
    "github.com/gocolly/colly/v2/extensions"
    "github.com/rs/zerolog/log"
)

// CollyScraper implements Scraper using Colly
type CollyScraper struct {
    config    *ScraperConfig
    collector *colly.Collector
}

// NewCollyScraper creates a new Colly-based scraper
func NewCollyScraper(config *ScraperConfig) *CollyScraper {
    c := colly.NewCollector(
        colly.UserAgent(config.UserAgent),
        colly.AllowedDomains(extractDomain(config.BaseURL)),
        colly.MaxDepth(2),
        colly.Async(true),
    )
    
    // Rate limiting
    c.Limit(&colly.LimitRule{
        DomainGlob:  "*",
        Parallelism: 2,
        Delay:       time.Second / time.Duration(config.RateLimit),
    })
    
    // Set custom headers
    for key, value := range config.Headers {
        c.OnRequest(func(r *colly.Request) {
            r.Headers.Set(key, value)
        })
    }
    
    // Use random user agent extension
    extensions.RandomUserAgent(c)
    extensions.Referer(c)
    
    return &CollyScraper{
        config:    config,
        collector: c,
    }
}

// Scrape executes the scraping job
func (s *CollyScraper) Scrape(ctx context.Context, params ScrapeParams) (*ScrapeResult, error) {
    result := &ScrapeResult{
        Products:   make([]*Product, 0),
        Prices:     make([]*Price, 0),
        Promotions: make([]*Promotion, 0),
        Metadata: &ScrapeMetadata{
            ScraperName: s.config.Name,
            StartTime:   time.Now(),
        },
    }
    
    // Product scraping
    s.collector.OnHTML(s.config.Selectors.ProductName, func(e *colly.HTMLElement) {
        product := s.extractProduct(e)
        if product != nil {
            result.Products = append(result.Products, product)
        }
    })
    
    // Price scraping
    s.collector.OnHTML(s.config.Selectors.ProductPrice, func(e *colly.HTMLElement) {
        price := s.extractPrice(e)
        if price != nil {
            result.Prices = append(result.Prices, price)
        }
    })
    
    // Promotion scraping
    s.collector.OnHTML(s.config.Selectors.Promotion, func(e *colly.HTMLElement) {
        promo := s.extractPromotion(e)
        if promo != nil {
            result.Promotions = append(result.Promotions, promo)
        }
    })
    
    // Error handling
    s.collector.OnError(func(r *colly.Response, err error) {
        log.Error().
            Str("scraper", s.config.Name).
            Str("url", r.Request.URL.String()).
            Int("status", r.StatusCode).
            Err(err).
            Msg("Scraping error")
    })
    
    // Visit the target URL
    err := s.collector.Visit(params.BuildURL(s.config.BaseURL))
    if err != nil {
        return nil, fmt.Errorf("failed to visit URL: %w", err)
    }
    
    // Wait for all goroutines to finish
    s.collector.Wait()
    
    result.Metadata.EndTime = time.Now()
    result.Metadata.Duration = result.Metadata.EndTime.Sub(result.Metadata.StartTime)
    result.Metadata.ItemsScraped = len(result.Products)
    
    return result, nil
}

// extractProduct extracts product data from HTML element
func (s *CollyScraper) extractProduct(e *colly.HTMLElement) *Product {
    return &Product{
        Name:        e.ChildText(s.config.Selectors.ProductName),
        ImageURL:    e.ChildAttr(s.config.Selectors.ProductImage, "src"),
        ProductURL:  e.Request.AbsoluteURL(e.ChildAttr(s.config.Selectors.ProductURL, "href")),
        ScrapedAt:   time.Now(),
        Source:      s.config.Name,
    }
}

// extractPrice extracts price data from HTML element
func (s *CollyScraper) extractPrice(e *colly.HTMLElement) *Price {
    priceText := e.Text
    amount := parsePrice(priceText) // utility function to parse price
    
    return &Price{
        Amount:    amount,
        Currency:  "USD", // or detect from page
        ScrapedAt: time.Now(),
        Source:    s.config.Name,
    }
}

// extractPromotion extracts promotion data from HTML element
func (s *CollyScraper) extractPromotion(e *colly.HTMLElement) *Promotion {
    return &Promotion{
        Title:       e.ChildText(".promo-title"),
        Description: e.ChildText(".promo-description"),
        DiscountPct: parseDiscount(e.Text),
        ScrapedAt:   time.Now(),
        Source:      s.config.Name,
    }
}
```

---

## Configuration System

### YAML Configuration

```yaml
# config/scrapers.yaml
scrapers:
  - name: "walmart"
    enabled: true
    base_url: "https://www.walmart.com"
    schedule: "0 */6 * * *"  # Every 6 hours
    rate_limit: 5  # 5 requests per second
    timeout: 30s
    max_retries: 3
    retry_delay: 5s
    user_agent: "Mozilla/5.0 (compatible; PreciumBot/1.0)"
    headers:
      Accept-Language: "en-US,en;q=0.9"
      Accept: "text/html,application/xhtml+xml"
    selectors:
      product_name: ".product-title"
      product_price: ".price-main .price-characteristic"
      product_image: ".product-image img"
      product_url: ".product-link"
      promotion: ".product-savings"
      pagination: ".pagination-next"
    categories:
      - "groceries"
      - "electronics"
    proxy_enabled: false
    javascript_enabled: false

  - name: "target"
    enabled: true
    base_url: "https://www.target.com"
    schedule: "30 */6 * * *"  # Every 6 hours, offset by 30 minutes
    rate_limit: 3
    timeout: 45s
    max_retries: 3
    retry_delay: 10s
    user_agent: "Mozilla/5.0 (compatible; PreciumBot/1.0)"
    selectors:
      product_name: "h3[data-test='product-title']"
      product_price: "span[data-test='product-price']"
      product_image: "img[data-test='product-image']"
      product_url: "a[data-test='product-link']"
      promotion: "div[data-test='promotion-badge']"
    categories:
      - "groceries"
    javascript_enabled: true  # Target might need JS rendering

  - name: "amazon"
    enabled: false  # Disabled for now (requires more sophisticated setup)
    base_url: "https://www.amazon.com"
    schedule: "0 */12 * * *"
    rate_limit: 2
    timeout: 60s
    max_retries: 5
    retry_delay: 15s
    proxy_enabled: true  # Amazon often blocks scrapers
```

### Configuration Loader

```go
// internal/config/scraper_config.go
package config

import (
    "fmt"
    
    "github.com/spf13/viper"
)

// ScraperConfigManager manages scraper configurations
type ScraperConfigManager struct {
    configs map[string]*ScraperConfig
}

// NewScraperConfigManager creates a new config manager
func NewScraperConfigManager(configPath string) (*ScraperConfigManager, error) {
    v := viper.New()
    v.SetConfigFile(configPath)
    v.SetConfigType("yaml")
    
    if err := v.ReadInConfig(); err != nil {
        return nil, fmt.Errorf("failed to read config: %w", err)
    }
    
    var cfg struct {
        Scrapers []*ScraperConfig `mapstructure:"scrapers"`
    }
    
    if err := v.Unmarshal(&cfg); err != nil {
        return nil, fmt.Errorf("failed to unmarshal config: %w", err)
    }
    
    manager := &ScraperConfigManager{
        configs: make(map[string]*ScraperConfig),
    }
    
    for _, scraperCfg := range cfg.Scrapers {
        manager.configs[scraperCfg.Name] = scraperCfg
    }
    
    return manager, nil
}

// GetConfig returns configuration for a specific scraper
func (m *ScraperConfigManager) GetConfig(name string) (*ScraperConfig, error) {
    cfg, exists := m.configs[name]
    if !exists {
        return nil, fmt.Errorf("scraper config not found: %s", name)
    }
    return cfg, nil
}

// GetEnabledScrapers returns all enabled scrapers
func (m *ScraperConfigManager) GetEnabledScrapers() []*ScraperConfig {
    enabled := make([]*ScraperConfig, 0)
    for _, cfg := range m.configs {
        if cfg.Enabled {
            enabled = append(enabled, cfg)
        }
    }
    return enabled
}
```

---

## Cron Job Scheduling

### Scheduler Implementation

```go
// internal/scheduler/scheduler.go
package scheduler

import (
    "context"
    "fmt"
    "time"
    
    "github.com/go-co-op/gocron/v2"
    "github.com/rs/zerolog/log"
)

// ScraperScheduler manages scheduled scraping jobs
type ScraperScheduler struct {
    scheduler gocron.Scheduler
    scrapers  map[string]Scraper
    queue     JobQueue
}

// NewScraperScheduler creates a new scheduler
func NewScraperScheduler(scrapers map[string]Scraper, queue JobQueue) (*ScraperScheduler, error) {
    s, err := gocron.NewScheduler()
    if err != nil {
        return nil, fmt.Errorf("failed to create scheduler: %w", err)
    }
    
    return &ScraperScheduler{
        scheduler: s,
        scrapers:  scrapers,
        queue:     queue,
    }, nil
}

// ScheduleScrapers schedules all configured scrapers
func (s *ScraperScheduler) ScheduleScrapers(configs []*ScraperConfig) error {
    for _, cfg := range configs {
        if !cfg.Enabled {
            log.Info().Str("scraper", cfg.Name).Msg("Scraper disabled, skipping")
            continue
        }
        
        scraper, exists := s.scrapers[cfg.Name]
        if !exists {
            log.Warn().Str("scraper", cfg.Name).Msg("Scraper not found, skipping")
            continue
        }
        
        // Schedule the job
        _, err := s.scheduler.NewJob(
            gocron.CronJob(cfg.Schedule, false),
            gocron.NewTask(s.runScraper, scraper, cfg),
            gocron.WithName(cfg.Name),
            gocron.WithTags(cfg.Name, "scraper"),
        )
        
        if err != nil {
            return fmt.Errorf("failed to schedule scraper %s: %w", cfg.Name, err)
        }
        
        log.Info().
            Str("scraper", cfg.Name).
            Str("schedule", cfg.Schedule).
            Msg("Scraper scheduled successfully")
    }
    
    return nil
}

// runScraper executes a scraping job
func (s *ScraperScheduler) runScraper(scraper Scraper, config *ScraperConfig) {
    ctx, cancel := context.WithTimeout(context.Background(), config.Timeout)
    defer cancel()
    
    log.Info().Str("scraper", config.Name).Msg("Starting scraping job")
    
    // Enqueue the job for processing by workers
    job := &ScrapeJob{
        ScraperName: config.Name,
        Params: ScrapeParams{
            MaxPages: 10,
            Timeout:  config.Timeout,
        },
        EnqueuedAt: time.Now(),
    }
    
    if err := s.queue.Enqueue(ctx, job); err != nil {
        log.Error().
            Str("scraper", config.Name).
            Err(err).
            Msg("Failed to enqueue scraping job")
        return
    }
    
    log.Info().
        Str("scraper", config.Name).
        Msg("Scraping job enqueued successfully")
}

// Start starts the scheduler
func (s *ScraperScheduler) Start() {
    s.scheduler.Start()
    log.Info().Msg("Scraper scheduler started")
}

// Stop stops the scheduler gracefully
func (s *ScraperScheduler) Stop(ctx context.Context) error {
    return s.scheduler.Shutdown()
}
```

---

## Data Pipeline

### Job Queue with Asynq

```go
// internal/queue/asynq_queue.go
package queue

import (
    "context"
    "encoding/json"
    "fmt"
    "time"
    
    "github.com/hibiken/asynq"
    "github.com/rs/zerolog/log"
)

const (
    TypeScrapeJob = "scrape:job"
)

// AsynqQueue implements JobQueue using Redis
type AsynqQueue struct {
    client *asynq.Client
    server *asynq.Server
}

// NewAsynqQueue creates a new Asynq-based job queue
func NewAsynqQueue(redisAddr string) *AsynqQueue {
    redisOpt := asynq.RedisClientOpt{Addr: redisAddr}
    
    return &AsynqQueue{
        client: asynq.NewClient(redisOpt),
        server: asynq.NewServer(
            redisOpt,
            asynq.Config{
                Concurrency: 10,  // 10 concurrent workers
                Queues: map[string]int{
                    "critical": 6,  // 60% of workers
                    "default":  3,  // 30% of workers
                    "low":      1,  // 10% of workers
                },
                RetryDelayFunc: func(n int, err error, task *asynq.Task) time.Duration {
                    return time.Duration(n) * time.Minute
                },
            },
        ),
    }
}

// Enqueue adds a job to the queue
func (q *AsynqQueue) Enqueue(ctx context.Context, job *ScrapeJob) error {
    payload, err := json.Marshal(job)
    if err != nil {
        return fmt.Errorf("failed to marshal job: %w", err)
    }
    
    task := asynq.NewTask(TypeScrapeJob, payload)
    
    // Determine queue priority
    queue := "default"
    if job.Priority == "high" {
        queue = "critical"
    } else if job.Priority == "low" {
        queue = "low"
    }
    
    info, err := q.client.EnqueueContext(
        ctx,
        task,
        asynq.Queue(queue),
        asynq.MaxRetry(3),
        asynq.Timeout(10*time.Minute),
    )
    
    if err != nil {
        return fmt.Errorf("failed to enqueue task: %w", err)
    }
    
    log.Info().
        Str("job_id", info.ID).
        Str("queue", queue).
        Str("scraper", job.ScraperName).
        Msg("Job enqueued successfully")
    
    return nil
}

// RegisterHandler registers job handlers
func (q *AsynqQueue) RegisterHandler(scraperManager *ScraperManager, processor *DataProcessor) {
    mux := asynq.NewServeMux()
    
    mux.HandleFunc(TypeScrapeJob, func(ctx context.Context, task *asynq.Task) error {
        var job ScrapeJob
        if err := json.Unmarshal(task.Payload(), &job); err != nil {
            return fmt.Errorf("failed to unmarshal job: %w", err)
        }
        
        return q.handleScrapeJob(ctx, &job, scraperManager, processor)
    })
    
    if err := q.server.Run(mux); err != nil {
        log.Fatal().Err(err).Msg("Failed to start queue server")
    }
}

// handleScrapeJob processes a scraping job
func (q *AsynqQueue) handleScrapeJob(
    ctx context.Context,
    job *ScrapeJob,
    scraperManager *ScraperManager,
    processor *DataProcessor,
) error {
    log.Info().
        Str("scraper", job.ScraperName).
        Msg("Processing scrape job")
    
    // Get scraper
    scraper, err := scraperManager.GetScraper(job.ScraperName)
    if err != nil {
        return fmt.Errorf("failed to get scraper: %w", err)
    }
    
    // Execute scraping
    result, err := scraper.Scrape(ctx, job.Params)
    if err != nil {
        return fmt.Errorf("scraping failed: %w", err)
    }
    
    // Process and store results
    if err := processor.Process(ctx, result); err != nil {
        return fmt.Errorf("processing failed: %w", err)
    }
    
    log.Info().
        Str("scraper", job.ScraperName).
        Int("products", len(result.Products)).
        Int("prices", len(result.Prices)).
        Msg("Scrape job completed successfully")
    
    return nil
}
```

### Data Processor

```go
// internal/processor/data_processor.go
package processor

import (
    "context"
    "fmt"
    
    "github.com/rs/zerolog/log"
)

// DataProcessor processes scraped data
type DataProcessor struct {
    validator   *Validator
    deduplicator *Deduplicator
    storage     *Storage
}

// NewDataProcessor creates a new data processor
func NewDataProcessor(storage *Storage) *DataProcessor {
    return &DataProcessor{
        validator:   NewValidator(),
        deduplicator: NewDeduplicator(storage),
        storage:     storage,
    }
}

// Process processes scraping results
func (p *DataProcessor) Process(ctx context.Context, result *ScrapeResult) error {
    // Step 1: Validate data
    validProducts, err := p.validator.ValidateProducts(result.Products)
    if err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }
    
    validPrices, err := p.validator.ValidatePrices(result.Prices)
    if err != nil {
        return fmt.Errorf("price validation failed: %w", err)
    }
    
    log.Info().
        Int("total", len(result.Products)).
        Int("valid", len(validProducts)).
        Msg("Products validated")
    
    // Step 2: Deduplicate data
    uniqueProducts, err := p.deduplicator.DeduplicateProducts(ctx, validProducts)
    if err != nil {
        return fmt.Errorf("deduplication failed: %w", err)
    }
    
    // Step 3: Store in database
    if err := p.storage.SaveProducts(ctx, uniqueProducts); err != nil {
        return fmt.Errorf("failed to save products: %w", err)
    }
    
    if err := p.storage.SavePrices(ctx, validPrices); err != nil {
        return fmt.Errorf("failed to save prices: %w", err)
    }
    
    if err := p.storage.SavePromotions(ctx, result.Promotions); err != nil {
        return fmt.Errorf("failed to save promotions: %w", err)
    }
    
    log.Info().
        Int("products", len(uniqueProducts)).
        Int("prices", len(validPrices)).
        Int("promotions", len(result.Promotions)).
        Msg("Data saved successfully")
    
    return nil
}
```

---

## Error Handling & Resilience

### Retry Mechanism

```go
// pkg/scraper/retry.go
package scraper

import (
    "context"
    "fmt"
    "time"
    
    "github.com/cenkalti/backoff/v4"
    "github.com/rs/zerolog/log"
)

// RetryableScraper wraps a scraper with retry logic
type RetryableScraper struct {
    scraper    Scraper
    maxRetries int
    backoff    backoff.BackOff
}

// NewRetryableScraper creates a scraper with retry capability
func NewRetryableScraper(scraper Scraper, maxRetries int) *RetryableScraper {
    bo := backoff.NewExponentialBackOff()
    bo.InitialInterval = 5 * time.Second
    bo.MaxInterval = 30 * time.Second
    bo.MaxElapsedTime = 5 * time.Minute
    
    return &RetryableScraper{
        scraper:    scraper,
        maxRetries: maxRetries,
        backoff:    backoff.WithMaxRetries(bo, uint64(maxRetries)),
    }
}

// Scrape executes scraping with retry logic
func (r *RetryableScraper) Scrape(ctx context.Context, params ScrapeParams) (*ScrapeResult, error) {
    var result *ScrapeResult
    var lastErr error
    
    operation := func() error {
        var err error
        result, err = r.scraper.Scrape(ctx, params)
        if err != nil {
            lastErr = err
            log.Warn().
                Str("scraper", r.scraper.Name()).
                Err(err).
                Msg("Scraping failed, will retry")
            return err
        }
        return nil
    }
    
    if err := backoff.Retry(operation, r.backoff); err != nil {
        return nil, fmt.Errorf("scraping failed after %d retries: %w", r.maxRetries, lastErr)
    }
    
    return result, nil
}
```

### Circuit Breaker

```go
// pkg/scraper/circuit_breaker.go
package scraper

import (
    "context"
    "fmt"
    
    "github.com/sony/gobreaker"
)

// CircuitBreakerScraper wraps a scraper with circuit breaker pattern
type CircuitBreakerScraper struct {
    scraper Scraper
    cb      *gobreaker.CircuitBreaker
}

// NewCircuitBreakerScraper creates a scraper with circuit breaker
func NewCircuitBreakerScraper(scraper Scraper) *CircuitBreakerScraper {
    settings := gobreaker.Settings{
        Name:        fmt.Sprintf("scraper-%s", scraper.Name()),
        MaxRequests: 3,
        Interval:    60 * time.Second,
        Timeout:     120 * time.Second,
        ReadyToTrip: func(counts gobreaker.Counts) bool {
            failureRatio := float64(counts.TotalFailures) / float64(counts.Requests)
            return counts.Requests >= 3 && failureRatio >= 0.6
        },
    }
    
    return &CircuitBreakerScraper{
        scraper: scraper,
        cb:      gobreaker.NewCircuitBreaker(settings),
    }
}

// Scrape executes scraping with circuit breaker protection
func (c *CircuitBreakerScraper) Scrape(ctx context.Context, params ScrapeParams) (*ScrapeResult, error) {
    result, err := c.cb.Execute(func() (interface{}, error) {
        return c.scraper.Scrape(ctx, params)
    })
    
    if err != nil {
        return nil, fmt.Errorf("circuit breaker: %w", err)
    }
    
    return result.(*ScrapeResult), nil
}
```

---

## Scalability Considerations

### Horizontal Scaling

1. **Worker Pools**: Multiple worker processes can consume from the same Redis queue
2. **Load Balancing**: Distribute scraping jobs across multiple servers
3. **Rate Limiting**: Per-scraper rate limits prevent overloading targets
4. **Queue Priorities**: Critical jobs (new stores) get priority over routine updates

### Optimization Strategies

```go
// Batch processing for database operations
func (s *Storage) SaveProductsBatch(ctx context.Context, products []*Product) error {
    const batchSize = 100
    
    for i := 0; i < len(products); i += batchSize {
        end := i + batchSize
        if end > len(products) {
            end = len(products)
        }
        
        batch := products[i:end]
        if err := s.insertProductBatch(ctx, batch); err != nil {
            return err
        }
    }
    
    return nil
}
```

### Monitoring Metrics

```go
// pkg/metrics/scraper_metrics.go
package metrics

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    ScrapingDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "scraper_duration_seconds",
            Help: "Duration of scraping operations",
        },
        []string{"scraper", "status"},
    )
    
    ItemsScraped = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "scraper_items_total",
            Help: "Total number of items scraped",
        },
        []string{"scraper", "type"},
    )
    
    ScrapingErrors = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "scraper_errors_total",
            Help: "Total number of scraping errors",
        },
        []string{"scraper", "error_type"},
    )
)
```

---

## Implementation Guide

### Step 1: Project Structure

```
backend/
├── cmd/
│   ├── scraper/
│   │   └── main.go           # Scraper service entry point
│   └── scheduler/
│       └── main.go           # Scheduler service entry point
├── internal/
│   ├── scraper/
│   │   ├── colly_scraper.go  # Colly implementation
│   │   ├── walmart.go        # Walmart-specific scraper
│   │   ├── target.go         # Target-specific scraper
│   │   └── factory.go        # Scraper factory
│   ├── scheduler/
│   │   └── scheduler.go      # Cron scheduler
│   ├── queue/
│   │   └── asynq_queue.go    # Job queue
│   ├── processor/
│   │   ├── validator.go      # Data validation
│   │   ├── deduplicator.go   # Deduplication
│   │   └── processor.go      # Main processor
│   └── config/
│       └── scraper_config.go # Config management
├── pkg/
│   ├── scraper/
│   │   ├── types.go          # Shared types
│   │   ├── retry.go          # Retry logic
│   │   └── circuit_breaker.go
│   └── metrics/
│       └── scraper_metrics.go
├── config/
│   └── scrapers.yaml         # Scraper configurations
└── migrations/
    └── 003_scraping_tables.sql
```

### Step 2: Database Schema

```sql
-- migrations/003_scraping_tables.sql

-- Scraping jobs tracking
CREATE TABLE scrape_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraper_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,  -- pending, running, completed, failed
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    items_scraped INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scrape_jobs_scraper ON scrape_jobs(scraper_name);
CREATE INDEX idx_scrape_jobs_status ON scrape_jobs(status);
CREATE INDEX idx_scrape_jobs_created ON scrape_jobs(created_at DESC);

-- Scraped products (before deduplication)
CREATE TABLE scraped_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_job_id UUID REFERENCES scrape_jobs(id),
    name VARCHAR(500) NOT NULL,
    image_url TEXT,
    product_url TEXT,
    source VARCHAR(100) NOT NULL,
    raw_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    product_id UUID REFERENCES products(id),  -- Link to main products table
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraped_products_job ON scraped_products(scrape_job_id);
CREATE INDEX idx_scraped_products_processed ON scraped_products(processed);

-- Scraping logs
CREATE TABLE scraping_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraper_name VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL,  -- info, warn, error
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraping_logs_scraper ON scraping_logs(scraper_name);
CREATE INDEX idx_scraping_logs_level ON scraping_logs(level);
CREATE INDEX idx_scraping_logs_created ON scraping_logs(created_at DESC);
```

### Step 3: Main Service

```go
// cmd/scraper/main.go
package main

import (
    "context"
    "os"
    "os/signal"
    "syscall"
    
    "github.com/rs/zerolog/log"
    "precium/internal/config"
    "precium/internal/queue"
    "precium/internal/scheduler"
    "precium/internal/scraper"
)

func main() {
    // Load configuration
    configManager, err := config.NewScraperConfigManager("config/scrapers.yaml")
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to load configuration")
    }
    
    // Initialize scrapers
    scraperManager := scraper.NewScraperManager()
    
    // Register scrapers
    scraperManager.Register("walmart", scraper.NewWalmartScraper(configManager.GetConfig("walmart")))
    scraperManager.Register("target", scraper.NewTargetScraper(configManager.GetConfig("target")))
    
    // Initialize job queue
    jobQueue := queue.NewAsynqQueue("redis:6379")
    
    // Initialize scheduler
    scraperScheduler, err := scheduler.NewScraperScheduler(
        scraperManager.GetAll(),
        jobQueue,
    )
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to create scheduler")
    }
    
    // Schedule scrapers
    if err := scraperScheduler.ScheduleScrapers(configManager.GetEnabledScrapers()); err != nil {
        log.Fatal().Err(err).Msg("Failed to schedule scrapers")
    }
    
    // Start scheduler
    scraperScheduler.Start()
    log.Info().Msg("Scraper service started")
    
    // Wait for interrupt signal
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan
    
    log.Info().Msg("Shutting down scraper service...")
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := scraperScheduler.Stop(ctx); err != nil {
        log.Error().Err(err).Msg("Error during shutdown")
    }
    
    log.Info().Msg("Scraper service stopped")
}
```

---

## Monitoring & Logging

### Structured Logging

```go
// All scrapers use structured logging
log.Info().
    Str("scraper", "walmart").
    Str("url", url).
    Int("products", len(products)).
    Dur("duration", duration).
    Msg("Scraping completed")

log.Error().
    Str("scraper", "target").
    Str("url", url).
    Err(err).
    Msg("Scraping failed")
```

### Prometheus Metrics

Expose metrics at `/metrics` endpoint:

```go
// Scraping duration histogram
ScrapingDuration.WithLabelValues("walmart", "success").Observe(duration.Seconds())

// Items scraped counter
ItemsScraped.WithLabelValues("walmart", "products").Add(float64(len(products)))

// Error counter
ScrapingErrors.WithLabelValues("walmart", "timeout").Inc()
```

### Health Checks

```go
// Health check endpoint
func (s *ScraperService) HealthCheck(c *fiber.Ctx) error {
    status := map[string]interface{}{
        "status": "healthy",
        "scrapers": s.getScraperStatus(),
        "queue_size": s.queue.Size(),
        "uptime": time.Since(s.startTime).String(),
    }
    
    return c.JSON(status)
}
```

---

## Best Practices

1. **Respect robots.txt**: Always check and respect website's robots.txt
2. **Rate Limiting**: Implement aggressive rate limiting to avoid overwhelming servers
3. **User Agent**: Use descriptive user agent with contact information
4. **Error Handling**: Graceful degradation, never crash on parsing errors
5. **Data Validation**: Always validate scraped data before storage
6. **Monitoring**: Track success rates, latency, and error types
7. **Legal Compliance**: Ensure scraping complies with website Terms of Service
8. **Proxy Rotation**: Use proxy rotation for sites with aggressive anti-scraping
9. **Caching**: Cache frequently accessed data to reduce load
10. **Documentation**: Keep scraper documentation up-to-date with website changes

---

## Future Enhancements

1. **JavaScript Rendering**: Integrate Playwright/Puppeteer for JS-heavy sites
2. **Proxy Management**: Automatic proxy rotation and health checking
3. **ML-based Extraction**: Use machine learning for adaptive element detection
4. **Anti-bot Detection**: Implement CAPTCHA solving and bot detection bypass
5. **Distributed Scraping**: Multi-region scraping for geo-restricted content
6. **Real-time Updates**: WebSocket support for price change notifications
7. **Image Processing**: Extract prices from product images using OCR
8. **API Integration**: Prefer official APIs when available (e.g., Amazon Product API)

---

## Summary

This web scraping architecture provides:

- ✅ **Scalable**: Worker pools, job queues, horizontal scaling
- ✅ **Configurable**: YAML-based configuration per scraper
- ✅ **Resilient**: Retry logic, circuit breakers, error handling
- ✅ **Observable**: Structured logging, Prometheus metrics, health checks
- ✅ **Maintainable**: Clear interfaces, modular design, extensive documentation
- ✅ **Performant**: Colly's efficiency, async processing, batch operations

The system is ready for Iteration 2 implementation, starting with 2-3 major stores and expanding based on demand.
