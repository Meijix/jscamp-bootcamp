/* =========================================================
   Footer
   =========================================================
   Es el componente más sencillo de todos: no recibe props ni
   tiene estado, solo devuelve HTML fijo.
   ========================================================= */

export function Footer() {
  return (
    <footer>
      {/*
        &copy; es la entidad HTML del símbolo ©.
        En JSX funciona igual que en HTML normal.
      */}
      <small>&copy; 2025 DevJobs. Todos los derechos reservados.</small>
    </footer>
  )
}
