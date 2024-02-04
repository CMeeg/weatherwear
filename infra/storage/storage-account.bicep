param name string
param location string = resourceGroup().location
param tags object = {}

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: name
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    allowBlobPublicAccess: true
    minimumTlsVersion: 'TLS1_2'
  }
}

var storageUrl = storageAccount.properties.primaryEndpoints.blob
var storageKey = storageAccount.listKeys().keys[0].value
var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${name};AccountKey=${storageKey};EndpointSuffix=core.windows.net'

output id string = storageAccount.id
output name string = storageAccount.name
output url string = storageUrl
output connectionString string = storageConnectionString
