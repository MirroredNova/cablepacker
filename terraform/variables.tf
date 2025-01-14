# variable "app_env" {
#   description = "Application environment"
#   type        = string
#   validation {
#     condition     = contains(["prod", "qa", "dev"], var.app_env)
#     error_message = "Variable app_env must be one of the following: 'prod', 'qa', 'dev'."
#   }
# }

# variable "app_location" {
#   description = "Application location"
#   type        = string
#   default     = "centralus"
# }

# variable "app_name" {
#   description = "Application name in Azure"
#   type        = string
# }
