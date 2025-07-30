import React from 'react'
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { MCPFormFields, useMCPSchema, MCPFieldConfig } from './mcp-field'
import { MCPModelType, getMCPModelMeta } from '@/models'

interface MCPFormProps {
  type: MCPModelType
  data?: any
  onSubmit: (data: any) => void
  onCancel?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  submitLabel?: string
  cancelLabel?: string
  className?: string
}

export const MCPForm: React.FC<MCPFormProps> = ({
  type,
  data,
  onSubmit,
  onCancel,
  isOpen = false,
  onOpenChange,
  title,
  submitLabel,
  cancelLabel,
  className
}) => {
  const { t } = useTranslation("common")
  const meta = getMCPModelMeta(type)
  
  // Criar schema baseado em metadata
  const schema = useMCPSchema(meta.fields, t)
  
  // Form setup
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: data || {}
  })

  const handleSubmit = (formData: any) => {
    onSubmit(formData)
    if (!data) {
      form.reset()
    }
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <MCPFormFields
          fields={meta.fields}
          form={form}
          t={t}
          className={className}
        />
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            {cancelLabel || t('actions.cancel')}
          </Button>
          <Button type="submit">
            {submitLabel || (data ? t('actions.save') : t('actions.create'))}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )

  // Se não for dialog, retornar apenas o form
  if (!isOpen && !onOpenChange) {
    return formContent
  }

  // Se for dialog
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {title || (data ? t(`${type}.edit_${type}`) : t(`${type}.new_${type}`))}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar MCPForm
export const useMCPForm = (type: MCPModelType) => {
  const { t } = useTranslation("common")
  const meta = getMCPModelMeta(type)
  const schema = useMCPSchema(meta.fields, t)
  
  const form = useForm({
    resolver: zodResolver(schema)
  })

  return {
    form,
    meta,
    schema,
    t
  }
}

// Componente de exemplo de uso
export const MCPFormExample: React.FC<{ type: MCPModelType }> = ({ type }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<any>(null)

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data)
    setFormData(data)
    setIsOpen(false)
  }

  const handleEdit = (data: any) => {
    setFormData(data)
    setIsOpen(true)
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsOpen(true)}>
        {t(`${type}.new_${type}`)}
      </Button>
      
      {formData && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Últimos dados:</h3>
          <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      )}

      <MCPForm
        type={type}
        data={formData}
        onSubmit={handleSubmit}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  )
} 