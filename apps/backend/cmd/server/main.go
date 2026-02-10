package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Precium API v1.0",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "precium-api",
			"version": "1.0.0",
		})
	})

	// API routes
	api := app.Group("/api/v1")

	// Documentation endpoint
	api.Get("/docs", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message":  "API Documentation",
			"version":  "1.0.0",
			"endpoints": []fiber.Map{
				{
					"path":        "/health",
					"method":      "GET",
					"description": "Health check endpoint",
				},
				{
					"path":        "/api/v1/docs",
					"method":      "GET",
					"description": "API documentation",
				},
			},
		})
	})

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	// Start server
	log.Printf("Starting Precium API on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
