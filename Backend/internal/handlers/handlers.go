package handlers

import (
	"guardian-vision/backend/internal/config"
	"guardian-vision/backend/internal/store"
)

type Handlers struct {
	Auth         *AuthHandler
	Student      *StudentHandler
	Catalog      *CatalogHandler
	Uniform      *UniformHandler
	Registration *RegistrationHandler
	Health       *HealthHandler
}

func New(store *store.Store, cfg config.Config) *Handlers {
	return &Handlers{
		Auth:         &AuthHandler{store: store, cfg: cfg},
		Student:      &StudentHandler{store: store},
		Catalog:      &CatalogHandler{store: store},
		Uniform:      &UniformHandler{store: store},
		Registration: &RegistrationHandler{store: store},
		Health:       &HealthHandler{store: store},
	}
}
