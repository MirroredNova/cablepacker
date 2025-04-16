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