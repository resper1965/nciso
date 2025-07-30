import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/components/layout/main-layout'
import { 
  MCPListPageTemplate, 
  MCPCardPageTemplate, 
  MCPFormPageTemplate,
  MCPComponentFactory,
  useMCPPage
} from '@/components/mcp'
import { DocumentUploader } from '@/components/isms/document-uploader'
import { EffectivenessGauge, CompactEffectivenessGauge } from '@/components/isms/effectiveness-gauge'
import { TreeViewPanel, buildTreeFromDomains } from '@/components/isms/tree-view-panel'
import { 
  mockPolicies, 
  mockControls, 
  mockDomains,
  getFrameworkMockData 
} from '@/models'

// =====================================================
// ISMS MCP DEMO PAGE
// =====================================================

export const ISMSMCPDemoPage: React.FC = () => {
  const { t } = useTranslation()
  const [selectedModel, setSelectedModel] = useState<'policy' | 'control' | 'domain' | 'framework'>('policy')
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'form'>('list')

  // =====================================================
  // MOCK DATA
  // =====================================================

  const mockData = {
    policy: mockPolicies,
    control: mockControls,
    domain: mockDomains,
    framework: getFrameworkMockData()
  }

  const treeData = buildTreeFromDomains(mockDomains)

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('pages.isms_mcp_demo.title')}
          </h1>
          <p className="text-gray-600">
            {t('pages.isms_mcp_demo.description')}
          </p>
        </div>

        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('pages.isms_mcp_demo.model_selection')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['policy', 'control', 'domain', 'framework'] as const).map((model) => (
                <Button
                  key={model}
                  variant={selectedModel === model ? 'default' : 'outline'}
                  onClick={() => setSelectedModel(model)}
                  className="h-auto p-4 flex-col space-y-2"
                >
                  <div className="text-2xl">
                    {model === 'policy' && '📄'}
                    {model === 'control' && '🛡️'}
                    {model === 'domain' && '📁'}
                    {model === 'framework' && '🏗️'}
                  </div>
                  <span className="text-sm font-medium">
                    {t(`models.${model}.title`)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {mockData[model].length} {t('common.items')}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('pages.isms_mcp_demo.view_mode')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                📋 {t('common.list_view')}
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                onClick={() => setViewMode('cards')}
              >
                🃏 {t('common.card_view')}
              </Button>
              <Button
                variant={viewMode === 'form' ? 'default' : 'outline'}
                onClick={() => setViewMode('form')}
              >
                ✏️ {t('common.form_view')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* MCP Components Demo */}
        <Tabs defaultValue="mcp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mcp">
              🔧 {t('pages.isms_mcp_demo.mcp_components')}
            </TabsTrigger>
            <TabsTrigger value="specialized">
              🎯 {t('pages.isms_mcp_demo.specialized_components')}
            </TabsTrigger>
            <TabsTrigger value="integration">
              🔗 {t('pages.isms_mcp_demo.integration')}
            </TabsTrigger>
          </TabsList>

          {/* MCP Components Tab */}
          <TabsContent value="mcp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('pages.isms_mcp_demo.mcp_templates')}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {t('pages.isms_mcp_demo.mcp_templates_description')}
                </p>
              </CardHeader>
              <CardContent>
                {viewMode === 'list' && (
                  <MCPListPageTemplate
                    type={selectedModel}
                    data={mockData[selectedModel]}
                    user={{ role: 'admin' }}
                    className="border rounded-lg p-4"
                  />
                )}
                
                {viewMode === 'cards' && (
                  <MCPCardPageTemplate
                    type={selectedModel}
                    data={mockData[selectedModel]}
                    user={{ role: 'admin' }}
                    className="border rounded-lg p-4"
                  />
                )}
                
                {viewMode === 'form' && (
                  <MCPFormPageTemplate
                    type={selectedModel}
                    user={{ role: 'admin' }}
                    className="border rounded-lg p-4"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specialized Components Tab */}
          <TabsContent value="specialized" className="space-y-6">
            {/* Document Uploader */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  📄 {t('pages.isms_mcp_demo.document_uploader')}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {t('pages.isms_mcp_demo.document_uploader_description')}
                </p>
              </CardHeader>
              <CardContent>
                <DocumentUploader
                  accept=".pdf,.doc,.docx,.txt"
                  maxSize={5 * 1024 * 1024}
                  multiple={true}
                />
              </CardContent>
            </Card>

            {/* Effectiveness Gauge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  📊 {t('pages.isms_mcp_demo.effectiveness_gauge')}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {t('pages.isms_mcp_demo.effectiveness_gauge_description')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <EffectivenessGauge
                    score={85}
                    previousScore={78}
                    target={90}
                    size="md"
                    showTrend={true}
                    showTarget={true}
                  />
                  <EffectivenessGauge
                    score={45}
                    previousScore={52}
                    target={80}
                    size="md"
                    showTrend={true}
                    showTarget={true}
                  />
                  <EffectivenessGauge
                    score={92}
                    previousScore={89}
                    target={85}
                    size="md"
                    showTrend={true}
                    showTarget={true}
                  />
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Compact Gauges</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CompactEffectivenessGauge score={75} />
                    <CompactEffectivenessGauge score={60} />
                    <CompactEffectivenessGauge score={90} />
                    <CompactEffectivenessGauge score={30} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tree View Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  🌳 {t('pages.isms_mcp_demo.tree_view_panel')}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {t('pages.isms_mcp_demo.tree_view_panel_description')}
                </p>
              </CardHeader>
              <CardContent>
                <TreeViewPanel
                  data={treeData}
                  showControls={true}
                  showCategories={true}
                  onNodeSelect={(node) => console.log('Selected node:', node)}
                  onNodeExpand={(node) => console.log('Expanded node:', node)}
                  onNodeCollapse={(node) => console.log('Collapsed node:', node)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  🔗 {t('pages.isms_mcp_demo.mcp_integration')}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {t('pages.isms_mcp_demo.mcp_integration_description')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* MCP Component Factory */}
                  <div className="space-y-4">
                    <h4 className="font-medium">MCP Component Factory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">Dynamic Form</h5>
                        {MCPComponentFactory.createForm('policy', {
                          onSubmit: (data) => console.log('Form submitted:', data),
                          onCancel: () => console.log('Form cancelled')
                        })}
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">Dynamic Table</h5>
                        {MCPComponentFactory.createTable('control', {
                          data: mockControls.slice(0, 3),
                          onEdit: (item) => console.log('Edit:', item),
                          onDelete: (item) => console.log('Delete:', item)
                        })}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* MCP Page Hook */}
                  <div className="space-y-4">
                    <h4 className="font-medium">MCP Page Hook</h4>
                    <div className="p-4 border rounded-lg">
                      <MCPPageHookDemo />
                    </div>
                  </div>

                  <Separator />

                  {/* Model Registry */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Model Registry</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">Available Models</h5>
                        <ul className="space-y-2 text-sm">
                          {(['policy', 'control', 'domain', 'framework'] as const).map((model) => (
                            <li key={model} className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {model}
                              </Badge>
                              <span>{mockData[model].length} items</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">Selected Model Info</h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Type:</span> {selectedModel}
                          </div>
                          <div>
                            <span className="font-medium">Items:</span> {mockData[selectedModel].length}
                          </div>
                          <div>
                            <span className="font-medium">View Mode:</span> {viewMode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

// =====================================================
// MCP PAGE HOOK DEMO COMPONENT
// =====================================================

const MCPPageHookDemo: React.FC = () => {
  const { t } = useTranslation()
  const {
    data,
    loading,
    formOpen,
    selectedItem,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleFormOpenChange
  } = useMCPPage('policy')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium">Policy Management</h5>
        <Button onClick={handleCreate} size="sm">
          Create Policy
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}
        </div>
        <div className="text-sm">
          <span className="font-medium">Form Open:</span> {formOpen ? 'Yes' : 'No'}
        </div>
        <div className="text-sm">
          <span className="font-medium">Selected Item:</span> {selectedItem ? selectedItem.name : 'None'}
        </div>
        <div className="text-sm">
          <span className="font-medium">Data Count:</span> {data.length}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleEdit(mockPolicies[0])}
        >
          Edit First
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleDelete(mockPolicies[0])}
        >
          Delete First
        </Button>
      </div>
    </div>
  )
}

export default ISMSMCPDemoPage 