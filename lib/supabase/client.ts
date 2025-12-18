export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[v0] Erro: Variáveis de ambiente do Supabase não configuradas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local",
    )

    // Retornar um cliente mock para evitar crashes
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "Supabase não configurado" } }),
            maybeSingle: async () => ({ data: null, error: { message: "Supabase não configurado" } }),
            then: async (resolve: any) => resolve({ data: null, error: { message: "Supabase não configurado" } }),
          }),
          order: () => ({
            then: async (resolve: any) => resolve({ data: [], error: { message: "Supabase não configurado" } }),
          }),
          then: async (resolve: any) => resolve({ data: [], error: { message: "Supabase não configurado" } }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: "Supabase não configurado" } }),
            then: async (resolve: any) => resolve({ data: null, error: { message: "Supabase não configurado" } }),
          }),
          then: async (resolve: any) => resolve({ data: null, error: { message: "Supabase não configurado" } }),
        }),
        update: () => ({
          eq: () => ({
            then: async (resolve: any) => resolve({ data: null, error: { message: "Supabase não configurado" } }),
          }),
        }),
        delete: () => ({
          eq: () => ({
            then: async (resolve: any) => resolve({ data: null, error: { message: "Supabase não configurado" } }),
          }),
        }),
      }),
      rpc: () => ({
        then: async (resolve: any) => resolve({ data: null, error: { message: "Supabase não configurado" } }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: "Supabase não configurado" } }),
          remove: async () => ({ data: null, error: { message: "Supabase não configurado" } }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any
  }

  return {
    from: (table: string) => ({
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
            const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}&${column}=eq.${value}`
            const response = await fetch(url, {
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
                Accept: "application/vnd.pgrst.object+json",
              },
            })

            if (!response.ok) {
              const error = await response.json()
              return { data: null, error }
            }

            const data = await response.json()
            return { data, error: null }
          },
          maybeSingle: async () => {
            const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
            const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}&${column}=eq.${value}`
            const response = await fetch(url, {
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
            })

            if (!response.ok) {
              const error = await response.json()
              return { data: null, error }
            }

            const data = await response.json()
            return { data: data[0] || null, error: null }
          },
          async then(resolve: any) {
            const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
            const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}&${column}=eq.${value}`
            const response = await fetch(url, {
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
            })
            const data = await response.json()
            if (!response.ok) {
              resolve({ data: null, error: data })
            } else {
              resolve({ data, error: null })
            }
          },
        }),
        limit: (count: number) => ({
          async then(resolve: any) {
            const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
            const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}&limit=${count}`
            const response = await fetch(url, {
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
            })
            const data = await response.json()
            if (!response.ok) {
              resolve({ data: null, error: data })
            } else {
              resolve({ data, error: null })
            }
          },
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          async then(resolve: any) {
            const ascending = options?.ascending !== false
            const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
            const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}&order=${column}.${ascending ? "asc" : "desc"}`
            const response = await fetch(url, {
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
            })
            const data = await response.json()
            if (!response.ok) {
              resolve({ data: null, error: data })
            } else {
              resolve({ data, error: null })
            }
          },
        }),
        async then(resolve: any) {
          const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
          const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}`
          const response = await fetch(url, {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
          })
          const data = await response.json()
          if (!response.ok) {
            resolve({ data: null, error: data })
          } else {
            resolve({ data, error: null })
          }
        },
      }),
      insert: (values: any) => ({
        select: (columns = "*") => ({
          single: async () => {
            const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
            const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}`
            const response = await fetch(url, {
              method: "POST",
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
                "Content-Type": "application/json",
                Prefer: "return=representation",
                Accept: "application/vnd.pgrst.object+json",
              },
              body: JSON.stringify(values),
            })

            if (!response.ok) {
              const error = await response.json()
              return { data: null, error }
            }

            const data = await response.json()
            return { data, error: null }
          },
          async then(resolve: any) {
            const encodedColumns = encodeURIComponent(columns.replace(/\s+/g, ""))
            const url = `${supabaseUrl}/rest/v1/${table}?select=${encodedColumns}`
            const response = await fetch(url, {
              method: "POST",
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
                "Content-Type": "application/json",
                Prefer: "return=representation",
              },
              body: JSON.stringify(values),
            })
            const data = await response.json()
            if (!response.ok) {
              resolve({ data: null, error: data })
            } else {
              resolve({ data, error: null })
            }
          },
        }),
        async then(resolve: any) {
          const url = `${supabaseUrl}/rest/v1/${table}`
          const response = await fetch(url, {
            method: "POST",
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(values),
          })
          const data = await response.json()
          if (!response.ok) {
            resolve({ data: null, error: data })
          } else {
            resolve({ data, error: null })
          }
        },
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          async then(resolve: any) {
            const url = `${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`
            const response = await fetch(url, {
              method: "PATCH",
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            })
            if (!response.ok) {
              const error = await response.json()
              resolve({ data: null, error })
            } else {
              resolve({ data: null, error: null })
            }
          },
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          async then(resolve: any) {
            const url = `${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`
            const response = await fetch(url, {
              method: "DELETE",
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
            })
            if (!response.ok) {
              const error = await response.json()
              resolve({ data: null, error })
            } else {
              resolve({ data: null, error: null })
            }
          },
        }),
      }),
    }),
    rpc: (fn: string, params: any) => ({
      async then(resolve: any) {
        const url = `${supabaseUrl}/rest/v1/rpc/${fn}`
        const response = await fetch(url, {
          method: "POST",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        })
        const data = await response.json()
        if (!response.ok) {
          resolve({ data: null, error: data })
        } else {
          resolve({ data, error: null })
        }
      },
    }),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => {
          const url = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`
          const response = await fetch(url, {
            method: "POST",
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: file,
          })

          if (!response.ok) {
            const error = await response.json()
            return { data: null, error }
          }

          const data = await response.json()
          return { data: { path }, error: null }
        },
        remove: async (paths: string[]) => {
          const url = `${supabaseUrl}/storage/v1/object/${bucket}`
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prefixes: paths }),
          })
          const data = await response.json()
          if (!response.ok) {
            return { data: null, error: data }
          }
          return { data, error: null }
        },
        getPublicUrl: (path: string) => {
          return {
            data: {
              publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`,
            },
          }
        },
      }),
    },
  }
}

export const createBrowserClient = createClient
