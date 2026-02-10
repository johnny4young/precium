package main

import "testing"

func TestMain(t *testing.T) {
	// Basic test to ensure the package compiles
	t.Run("Basic", func(t *testing.T) {
		if 1+1 != 2 {
			t.Error("Math is broken")
		}
	})
}
