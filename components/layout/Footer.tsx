export function Footer() {
  return (
    <footer className="bg-surface border-t">
      <div className="container mx-auto p-8 text-center text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Vitrine de Craques. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
