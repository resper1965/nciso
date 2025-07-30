'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Filter, Download, MoreHorizontal } from 'lucide-react'

interface MCPTableProps {
  title: string
  data: any[]
  columns: {
    key: string
    label: string
    sortable?: boolean
    render?: (value: any, row: any) => React.ReactNode
  }[]
  loading?: boolean
  onSearch?: (query: string) => void
  onAdd?: () => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onExport?: () => void
}

export function MCPTable({
  title,
  data,
  columns,
  loading = false,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  onExport
}: MCPTableProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const filteredData = data.filter(row => {
    if (!searchQuery) return true
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {onAdd && (
              <Button onClick={onAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('common.create')}
              </Button>
            )}
            {onExport && (
              <Button variant="outline" onClick={onExport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t('common.export')}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {onSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  onSearch(e.target.value)
                }}
                className="pl-10"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {t('common.loading')}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.sortable && sortColumn === column.key && (
                          <span className="text-primary-500">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {t('common.noData')}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {column.render
                            ? column.render(row[column.key], row)
                            : String(row[column.key] || '')}
                        </td>
                      ))}
                      {(onEdit || onDelete) && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(row)}
                              >
                                {t('common.edit')}
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(row)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                {t('common.delete')}
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 