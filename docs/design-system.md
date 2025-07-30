# 🎨 Design System n.CISO

## 📋 **Visão Geral**

O Design System `n.CISO` é baseado em **Tailwind CSS**, **Radix UI** e **ShadCN UI**, seguindo os princípios de design corporativo moderno com **tema escuro predominante** e cor de destaque `#00ade0`.

## 🎯 **Princípios de Design**

### **Cores**
- **Accent:** `#00ade0` (azul ciano corporativo)
- **Background:** `hsl(222, 84%, 4.9%)` (azul escuro)
- **Foreground:** `hsl(210, 40%, 98%)` (branco)
- **Card:** `hsl(222, 84%, 4.9%)` (azul escuro)
- **Border:** `hsl(217, 32.6%, 17.5%)` (cinza escuro)
- **Success:** `#10b981` (verde)
- **Warning:** `#f59e0b` (amarelo)
- **Error:** `#ef4444` (vermelho)

### **Tipografia**
- **Font:** Montserrat (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700
- **Sizes:** text-xs, text-sm, text-base, text-lg, text-xl, text-2xl

### **Espaçamento**
- **Base:** 4px (0.25rem)
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

## 🧩 **Componentes Base**

### **Layout Components**

#### **MainLayout**
```tsx
import { MainLayout } from "@/components/layout/main-layout"

<MainLayout 
  title="Título da Página"
  subtitle="Subtítulo opcional"
  showSearch={true}
  showNotifications={true}
  showAddButton={true}
  onAddClick={() => {}}
>
  {/* Conteúdo da página */}
</MainLayout>
```

#### **Sidebar**
```tsx
// Navegação lateral corporativa
<div className="w-80 bg-slate-800 border-r border-slate-700">
  {/* Logo n.CISO */}
  {/* Menu hierárquico */}
  {/* Perfil do usuário */}
</div>
```

#### **Header**
```tsx
// Header dinâmico com busca e notificações
<header className="bg-card border-b border-border px-6 py-4">
  {/* Título + Busca + Notificações + Toggle de Tema */}
</header>
```

#### **Card**
```tsx
// Cards com tema escuro
<div className="nciso-card p-6">
  {children}
</div>
```

### **Form Components**

#### **Input**
```tsx
import { Input } from "@/components/ui/input"

<Input 
  type="text"
  placeholder="Digite aqui..."
  className="w-full"
/>
```

#### **Button**
```tsx
import { Button } from "@/components/ui/button"

// Primary (n.CISO)
<Button className="bg-nciso-cyan hover:bg-nciso-blue text-white">
  Salvar
</Button>

// Secondary
<Button variant="outline" className="border-border text-foreground">
  Cancelar
</Button>

// Destructive
<Button variant="destructive">
  Excluir
</Button>
```

#### **Form with Validation**
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  control_type: z.enum(["preventive", "detective", "corrective"]),
  effectiveness_score: z.number().min(0).max(100),
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### **Data Display Components**

#### **Table**
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<div className="nciso-card">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>
            <div>
              <div className="font-medium text-foreground">{item.name}</div>
              <div className="text-sm text-muted-foreground">{item.description}</div>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={getStatusVariant(item.status)}>
              {item.status}
            </Badge>
          </TableCell>
          <TableCell>
            <Button size="sm" variant="outline">Editar</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

#### **Badge**
```tsx
import { Badge } from "@/components/ui/badge"

// Status variants
<Badge variant="default">Ativo</Badge>
<Badge variant="secondary">Inativo</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="outline">Rascunho</Badge>
```

### **Overlay Components**

#### **Dialog (Modal)**
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Editar Item</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Form content */}
    </div>
    <DialogFooter>
      <Button type="submit">Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### **Theme Toggle**
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

<ThemeToggle />
```

## 📱 **Responsividade**

### **Breakpoints**
```css
/* Mobile First */
.sm: 640px   /* Tablets pequenos */
.md: 768px   /* Tablets */
.lg: 1024px  /* Desktops pequenos */
.xl: 1280px  /* Desktops grandes */
.2xl: 1536px /* Telas grandes */
```

### **Layout Adaptativo**
```tsx
// Sidebar responsiva
<Sidebar className="hidden lg:flex" />

// Header responsivo
<Header showSearch={true} showNotifications={true} />
```

## ♿ **Acessibilidade**

### **Contraste**
- **Mínimo 4.5:1** para texto normal
- **Cores adaptadas** para tema escuro
- **Estados visuais** claros

### **Navegação**
- **Keyboard navigation** completa
- **Focus management** correto
- **Screen reader support**

## 🎨 **Identidade Visual**

### **Logo n.CISO**
```tsx
<div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-nciso-cyan rounded-lg flex items-center justify-center">
    <Shield className="w-5 h-5 text-white" />
  </div>
  <div>
    <h1 className="text-xl font-bold text-white">n.CISO</h1>
    <p className="text-xs text-slate-400">Security Platform</p>
  </div>
</div>
```

### **Cores n.CISO**
```css
/* Cores Principais */
--nciso-cyan: hsl(191, 100%, 50%);     /* #00ade0 */
--nciso-blue: hsl(207, 90%, 54%);      /* Azul primário */

/* Tema Escuro */
--background: hsl(222, 84%, 4.9%);      /* Azul escuro */
--foreground: hsl(210, 40%, 98%);       /* Branco */
--card: hsl(222, 84%, 4.9%);           /* Azul escuro */
--border: hsl(217, 32.6%, 17.5%);      /* Cinza escuro */
```

## 🚀 **Implementação**

### **1. Configuração Tailwind**
```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        nciso: {
          cyan: "hsl(191, 100%, 50%)",
          blue: "hsl(207, 90%, 54%)",
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
}
```

### **2. Tema por Padrão**
```tsx
// src/app/layout.tsx
<html lang="pt-BR" className="dark">
  <body>
    <ThemeProvider defaultTheme="dark">
      {children}
    </ThemeProvider>
  </body>
</html>
```

### **3. Componentes Base**
```tsx
// Classes utilitárias
.nciso-card {
  @apply bg-card border border-border rounded-lg shadow-sm;
}

.nciso-button-primary {
  @apply bg-nciso-cyan hover:bg-nciso-blue text-white font-medium px-4 py-2 rounded-md transition-colors duration-200;
}
```

## ✅ **Checklist de Implementação**

- [x] Configurar Tailwind com tema escuro
- [x] Implementar ThemeProvider
- [x] Criar componentes de layout (Sidebar, Header, MainLayout)
- [x] Implementar componentes UI com tema escuro
- [x] Adicionar toggle de tema
- [x] Testar responsividade
- [x] Validar acessibilidade
- [x] Documentar uso dos componentes

---

**Design System n.CISO** - Tema escuro corporativo moderno! 🌙 