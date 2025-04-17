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

variable "default_tags" {
  type        = map(string)
  description = "Default tags for the resources"
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

## APP SERVICE PLAN

variable "asp_os_type" {
  type        = string
  description = "App service plan OS type"
  default     = "Linux"
}

variable "asp_sku" {
  type        = string
  description = "App service plan SKU"
  default     = "S1"
}

## APP SERVICE

variable "app_service_public_network_access_enabled" {
  type        = bool
  description = "Toggles public network access for Web"
  default     = true
}

variable "app_service_node_version" {
  type        = string
  description = "Node.js version to use for App service"
  default     = "18-lts"
}

variable "app_service_settings" {
  type        = map(string)
  description = "Web App service environment variables"
}

variable "app_service_startup_command" {
  type        = string
  description = "Web App service startup command"
  default     = "/home/site/wwwroot/startup.sh"
}

# variable "app_service_custom_domain" {
#   type        = string
#   description = "Custom domain for app service (Web Service)"
#   default     = "solarassista-qa.alliantenergy.com"
# }

variable "app_app_service_always_on" {
  type        = bool
  description = "Toggles Always On in app service settings"
  default     = false
}

variable "app_service_logs_detailed_error_messages" {
  type        = bool
  description = "Toggles detailed error messages in logs in app service"
  default     = true
}

variable "app_service_logs_failed_request_tracing" {
  type        = bool
  description = "Toggles failed request tracking in logs in app service"
  default     = true
}

variable "app_service_logs_file_system_retention_in_days" {
  type        = number
  description = "File system logs retention in days"
  default     = 3
}

variable "app_service_logs_file_system_retention_in_mb" {
  type        = number
  description = "File system logs retention in MB"
  default     = 100
}

## LOCALS

locals {
  resource_group_name = join("-", compact(["rg", var.base_name, var.env_name, var.resource_region_in_name]))
  asp_name = join("-", compact(["asp", var.base_name, var.env_name, var.resource_region_in_name]))
  app_service_name = join("-", compact(["app", var.base_name, var.env_name, var.resource_region_in_name]))
}