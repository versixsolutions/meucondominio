export default function LoadingSpinner({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4 font-semibold">{message}</p>
      </div>
    </div>
  )
}
