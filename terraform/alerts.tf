# resource "azurerm_resource_group" "alerts" {
#   name      = "rg-alerts-${var.app_name}-${var.app_env}"
#   location  = "centralus"
# }

# resource "azurerm_monitor_action_group" "team" {
#   name                = "ag-alert-team-${var.app_name}-${var.app_env}"
#   resource_group_name = azurerm_resource_group.alerts.name
#   short_name          = "emailus"


#   email_receiver {
#     name          = "sendtoteam"
#     email_address = "ENTERYOURTEAMEMAILHERE@alliantenergy.com"
#   }

# }

# resource "azurerm_monitor_activity_log_alert" "servicehealth" {
#   name                = "alar-servicehealth-subscription-${var.app_name}-${var.app_env}"
#   resource_group_name = azurerm_resource_group.alerts.name
#   location            = azurerm_resource_group.alerts.location
#   scopes              = [ data.azurerm_subscription.current.id ]
#   description         = "This alert monitors for service health issues and emails issues"

#   criteria {
#     category          = "ServiceHealth"
#     service_health {
#       locations       = ["global","centralus"]
#     }
#   }

#   action {
#     action_group_id = azurerm_monitor_action_group.toteam.id
#   }
# }