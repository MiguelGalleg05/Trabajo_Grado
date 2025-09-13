export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-muted rounded-lg p-2 animate-pulse">
                  <div className="h-6 w-6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            <div className="h-8 w-32 bg-background rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <div className="space-y-4 text-center">
                  <div className="h-12 w-12 bg-muted rounded mx-auto animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded mx-auto animate-pulse"></div>
                    <div className="h-3 w-24 bg-muted rounded mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-56 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 bg-muted rounded mx-auto animate-pulse"></div>
                  <div className="h-4 w-40 bg-muted rounded mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
