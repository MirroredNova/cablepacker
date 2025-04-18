resource "azurerm_linux_web_app" "app" {
  depends_on = [
    azurerm_service_plan.asp
  ]
  resource_group_name = azurerm_resource_group.rg.name
  name                = local.app_service_name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id
  public_network_access_enabled = var.app_service_public_network_access_enabled
  https_only = true
  
  site_config {
    application_stack {
      node_version = var.app_service_node_version
    }
    always_on        = var.app_app_service_always_on
    app_command_line = var.app_service_startup_command
  }

  logs {
    detailed_error_messages = var.app_service_logs_detailed_error_messages
    failed_request_tracing  = var.app_service_logs_failed_request_tracing
    http_logs {
      file_system {
        retention_in_days = var.app_service_logs_file_system_retention_in_days
        retention_in_mb   = var.app_service_logs_file_system_retention_in_mb
      }
    }
  }
  
  app_settings = var.app_service_settings
  tags = azurerm_resource_group.rg.tags
}

resource "azurerm_app_service_virtual_network_swift_connection" "web_appout_swift_connection" {
  depends_on = [
    azurerm_linux_web_app.app
  ]
  app_service_id = azurerm_linux_web_app.app.id
  subnet_id      = data.azurerm_subnet.subnet_appout.id
}

output "web_app_service_id" {
  value       = azurerm_linux_web_app.app.id
  description = "Web App service id"
}

output "web_app_service_name" {
  value       = azurerm_linux_web_app.app.name
  description = "Web App service name"
}

output "web_app_service_url" {
  value       = join("", ["https://", azurerm_linux_web_app.app.default_hostname])
  description = "Web App service URL"
}