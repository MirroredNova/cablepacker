resource "azurerm_linux_web_app" "app" {
  depends_on = [
    azurerm_service_plan.asp
  ]
  resource_group_name = azurerm_resource_group.rg.name
  name                = local.app_service_name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id
  public_network_access_enabled = var.app_service_public_network_access_enabled
  https_only = false
  
  site_config {
    application_stack {
      node_version = var.app_service_node_version
    }
    always_on        = var.app_app_service_always_on
    app_command_line = var.app_service_startup_command
  }
  
  app_settings = merge(var.app_service_settings, {
    "WEBSITE_NODE_DEFAULT_VERSION" = var.app_service_node_version
    "SCM_DO_BUILD_DURING_DEPLOYMENT": "true"
    "ENABLE_ORYX_BUILD": "true"
  })
  tags = azurerm_resource_group.rg.tags
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