## AZURE AUTH VARIABLES

variable "arm_client_id" {
  description = "Azure client id to use for authentication"
  sensitive   = true
  type        = string
}

variable "arm_client_secret" {
  description = "Azure client secret to use for authentication"
  sensitive   = true
  type        = string
}

variable "arm_subscription_id" {
  description = "Azure subscription id to use under which all resources will be created"
  sensitive   = true
  type        = string
}

variable "arm_tenant_id" {
  description = "Azure tenant id to use under which all resources will be created"
  sensitive   = true
  type        = string
}

## BASE VARIABLES

variable "base_name" {
  default     = "cablepacker"
  description = "Base name of the resources. This will be used as a prefix for all resources along with resource type identifier."
  type        = string
}

variable "env_name" {
  default     = ""
  description = "Environment name to be used in the name of resources"
  type        = string
}

variable "resource_region" {
  default     = "centralus"
  description = "Region of the resources."
  type        = string
}

variable "resource_region_in_name" {
  default     = "cus"
  description = "Shorthand region name for the resource's name."
  type        = string
}

## VNET AND PRIVATE ENDPOINT

variable "vnet_resource_group" {
  type        = string
  default     = "rg-cablepacker-qa-network"
  description = "VNet resource group name"
}

variable "vnet_name" {
  type        = string
  default     = "vnet-cablepacker-qa"
  description = "VNet name to be used with Private Endpoints"
}

variable "vnet_subnet_name" {
  type        = string
  default     = "snet-cablepacker-qa-pe"
  description = "Subnet name inside the VNet"
}

variable "vnet_subnet_appout_name" {
  type        = string
  default     = "snet-cablepacker-qa-appout"
  description = "Subnet name inside the VNet used for outbound connections"
}

locals {
  resource_group_name = join("-", compact(["rg", var.base_name, var.env_name, var.resource_region_in_name]))
}