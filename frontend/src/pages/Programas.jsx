import ProgramasGrid from '../components/public/ProgramasGrid';

const Programas = () => (
  <main>
    {/* Banner de sección */}
    <div className="bg-gradient-to-r from-[#1e3a5f] to-blue-700 text-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-blue-300 text-sm mb-2">CESFAM Valle Mar</p>
        <h1 className="text-4xl font-extrabold">Programas de Salud</h1>
        <p className="text-blue-200 mt-2 max-w-xl">
          Atención especializada y preventiva para toda la familia, en cada etapa de la vida.
        </p>
      </div>
    </div>
    <ProgramasGrid />
  </main>
);

export default Programas;