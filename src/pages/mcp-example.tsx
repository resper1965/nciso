import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { 
  MCPListPageTemplate, 
  MCPCardPageTemplate, 
  MCPFormPageTemplate,
  MCPComponentFactory,
  useMCPPage
} from '@/components/mcp'
import { MCPModelType, getMCPMockData } from '@/models'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'

const MCPExamplePage: React.FC = () => {
  const { t } = useTranslation("common")
  const [selectedType, setSelectedType] = React.useState<MCPModelType>('domain')
  const [viewMode, setViewMode] = React.useState<'list' | 'cards' | 'form'>('list')

  const handleCreate = () => {
    console.log('Create new item')
  }

  const handleEdit = (item: any) => {
    console.log('Edit item:', item)
  }

  const handleDelete = (item: any) => {
    console.log('Delete item:', item)
  }

  const handleView = (item: any) => {
    console.log('View item:', item)
  }

  const handleExport = (item: any) => {
    console.log('Export item:', item)
  }

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data)
  }

  const mockData = getMCPMockData(selectedType)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Components Example</h1>
          <p className="text-muted-foreground">
            Exemplos de uso dos componentes MCP - Model Content Protocol
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium">Model Type:</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value as MCPModelType)}
              className="ml-2 p-2 border rounded"
            >
              <option value="policy">Policy</option>
              <option value="control">Control</option>
              <option value="domain">Domain</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">View Mode:</label>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value as 'list' | 'cards' | 'form')}
              className="ml-2 p-2 border rounded"
            >
              <option value="list">List (Table)</option>
              <option value="cards">Cards</option>
              <option value="form">Form</option>
            </select>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'cards' | 'form')}>
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="cards">Cards View</TabsTrigger>
            <TabsTrigger value="form">Form View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">List Page Template</h2>
              <MCPListPageTemplate
                type={selectedType}
                title={`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s`}
                subtitle={`Manage your ${selectedType}s`}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onExport={handleExport}
                data={mockData}
                showPagination={true}
                pageSize={5}
              />
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cards Page Template</h2>
              <MCPCardPageTemplate
                type={selectedType}
                title={`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s`}
                subtitle={`Manage your ${selectedType}s`}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onExport={handleExport}
                data={mockData}
                variant="default"
              />
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Form Page Template</h2>
              <MCPFormPageTemplate
                type={selectedType}
                title={`Create New ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
                onSubmit={handleSubmit}
                onCancel={() => console.log('Canceled')}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Component Factory Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Form Component</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Formulário gerado automaticamente baseado no metadata do modelo.
              </p>
              <Button 
                onClick={() => {
                  const form = MCPComponentFactory.createForm(selectedType, {
                    onSubmit: handleSubmit,
                    isOpen: true,
                    onOpenChange: () => {}
                  })
                  console.log('Form component created:', form)
                }}
              >
                Create Form
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Table Component</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tabela gerada automaticamente baseada no metadata do modelo.
              </p>
              <Button 
                onClick={() => {
                  const table = MCPComponentFactory.createTable(selectedType, {
                    data: mockData,
                    onEdit: handleEdit,
                    onDelete: handleDelete
                  })
                  console.log('Table component created:', table)
                }}
              >
                Create Table
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Card Component</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Card gerado automaticamente baseado no metadata do modelo.
              </p>
              <Button 
                onClick={() => {
                  const card = MCPComponentFactory.createCard(selectedType, {
                    item: mockData[0],
                    onEdit: handleEdit,
                    onDelete: handleDelete
                  })
                  console.log('Card component created:', card)
                }}
              >
                Create Card
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Hook Example</h2>
          <div className="p-4 border rounded-lg">
            <HookExample type={selectedType} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Componente de exemplo usando o hook
const HookExample: React.FC<{ type: MCPModelType }> = ({ type }) => {
  const {
    data,
    loading,
    isFormOpen,
    editingItem,
    handleCreate,
    handleEdit,
    handleDelete,
    handleView,
    handleExport,
    handleSubmit,
    handleCancel
  } = useMCPPage(type)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">useMCPPage Hook</h3>
      <p className="text-sm text-muted-foreground">
        Hook que gerencia estado completo de uma página MCP.
      </p>
      
      <div className="flex items-center space-x-2">
        <Button onClick={handleCreate} disabled={loading}>
          Create New
        </Button>
        <Button variant="outline" onClick={() => console.log('Current state:', { data, loading, isFormOpen, editingItem })}>
          Log State
        </Button>
      </div>

      <div className="text-sm">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Form Open:</strong> {isFormOpen ? 'Yes' : 'No'}</p>
        <p><strong>Editing Item:</strong> {editingItem ? 'Yes' : 'No'}</p>
        <p><strong>Data Count:</strong> {data.length}</p>
      </div>
    </div>
  )
}

export default MCPExamplePage 