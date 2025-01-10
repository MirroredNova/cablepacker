terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0" # Update this to next major version when available. (Beware of breaking changes.)
    }
  }
}

provider "azurerm" {
  features {}
}
