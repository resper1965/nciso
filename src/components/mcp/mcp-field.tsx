import React from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { ptBR, enUS, es } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

// Tipos para campos MCP
export type MCPFieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean' | 'relation' | 'tags' | 'multiselect'

export type MCPFieldConfig = {
  label: string
  type: MCPFieldType
  required: boolean
  options?: { value: string; label: string }[]
  validation?: any
  placeholder?: string
  description?: string
  disabled?: boolean
  multiple?: boolean
  relation?: string
}

interface MCPFieldProps {
  field: MCPFieldConfig
  name: string
  form: any
  t: any
  className?: string
}

// Locale mapping para date-fns
const localeMap = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es': es
}

export const MCPField: React.FC<MCPFieldProps> = ({ 
  field, 
  name, 
  form, 
  t, 
  className 
}) => {
  const { i18n } = useTranslation()
  const currentLocale = localeMap[i18n.language as keyof typeof localeMap] || enUS

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder || t(field.label)}
            disabled={field.disabled}
            className={className}
          />
        )

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || t(field.label)}
            disabled={field.disabled}
            className={cn("min-h-[100px]", className)}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || t(field.label)}
            disabled={field.disabled}
            className={className}
          />
        )

      case 'select':
        return (
          <Select disabled={field.disabled}>
            <SelectTrigger className={className}>
              <SelectValue placeholder={t(field.label)} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => (
                <Badge
                  key={option.value}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                >
                  {t(option.label)}
                </Badge>
              ))}
            </div>
            <Input
              placeholder={t('forms.add_tag')}
              className={className}
            />
          </div>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.getValues(name) && "text-muted-foreground",
                  className
                )}
                disabled={field.disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.getValues(name) ? (
                  format(new Date(form.getValues(name)), "PPP", { locale: currentLocale })
                ) : (
                  <span>{t('forms.select_date')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.getValues(name) ? new Date(form.getValues(name)) : undefined}
                onSelect={(date) => form.setValue(name, date?.toISOString())}
                initialFocus
                locale={currentLocale}
              />
            </PopoverContent>
          </Popover>
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={name}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={field.disabled}
            />
            <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t(field.label)}
            </label>
          </div>
        )

      case 'relation':
        return (
          <div className="space-y-2">
            <Input
              placeholder={t('forms.search_relation')}
              className={className}
            />
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              <div className="text-sm text-muted-foreground">
                {t('forms.no_relations_found')}
              </div>
            </div>
          </div>
        )

      case 'tags':
        return (
          <div className="space-y-2">
            <Input
              placeholder={t('forms.add_tag')}
              className={className}
            />
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer">
                {t('forms.example_tag')} ×
              </Badge>
            </div>
          </div>
        )

      default:
        return (
          <Input
            placeholder={field.placeholder || t(field.label)}
            disabled={field.disabled}
            className={className}
          />
        )
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: formField }) => (
        <FormItem className={className}>
          <FormLabel>
            {t(field.label)}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {renderField()}
          </FormControl>
          {field.description && (
            <p className="text-sm text-muted-foreground">
              {t(field.description)}
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Componente para renderizar campos baseados em metadata
export const MCPFormFields: React.FC<{
  fields: Record<string, MCPFieldConfig>
  form: any
  t: any
  className?: string
}> = ({ fields, form, t, className }) => {
  return (
    <div className="space-y-4">
      {Object.entries(fields).map(([key, field]) => (
        <MCPField
          key={key}
          field={field}
          name={key}
          form={form}
          t={t}
          className={className}
        />
      ))}
    </div>
  )
}

// Hook para criar schema baseado em metadata
export const useMCPSchema = (fields: Record<string, MCPFieldConfig>, t: any) => {
  const { z } = require('zod')
  
  const schemaObject: any = {}
  
  Object.entries(fields).forEach(([key, field]) => {
    let fieldSchema: any
    
    switch (field.type) {
      case 'text':
      case 'textarea':
        fieldSchema = z.string()
        if (field.validation?.min) {
          fieldSchema = fieldSchema.min(field.validation.min, t(`validation.${key}_min`))
        }
        break
        
      case 'number':
        fieldSchema = z.number()
        if (field.validation?.min !== undefined) {
          fieldSchema = fieldSchema.min(field.validation.min, t(`validation.${key}_min`))
        }
        if (field.validation?.max !== undefined) {
          fieldSchema = fieldSchema.max(field.validation.max, t(`validation.${key}_max`))
        }
        break
        
      case 'select':
        if (field.options) {
          const values = field.options.map(opt => opt.value)
          fieldSchema = z.enum(values as [string, ...string[]])
        } else {
          fieldSchema = z.string()
        }
        break
        
      case 'date':
        fieldSchema = z.string().datetime().optional()
        break
        
      case 'boolean':
        fieldSchema = z.boolean()
        break
        
      case 'tags':
      case 'multiselect':
        fieldSchema = z.array(z.string()).optional()
        break
        
      default:
        fieldSchema = z.string()
    }
    
    if (!field.required) {
      fieldSchema = fieldSchema.optional()
    }
    
    schemaObject[key] = fieldSchema
  })
  
  return z.object(schemaObject)
} 