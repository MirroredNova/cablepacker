# variable "app_env" {
#   description = "Sitecore application environment"
#   type        = string
#   validation {
#     condition     = contains(["prod", "qa", "dev"], var.app_env)
#     error_message = "Variable app_env must be one of the following: 'prod', 'qa', 'dev'."
#   }
# }

# variable "app_location" {
#   description = "Sitecore application location"
#   type        = string
#   default     = "centralus"
# }

# variable "app_name" {
#   description = "Application name in Azure"
#   type        = string
# }
