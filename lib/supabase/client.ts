export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const mockQueryBuilder: any = {
      eq: function (column: string, value: any) {
        return this
      },
      order: function (column: string, options?: any) {
        return this
      },
      limit: function (count: number) {
        return this
      },
      single: async () => ({ data: null, error: { message: "Supabase não configurado" } }),
      maybeSingle: async () => ({ data: null, error: { message: "Supabase não configurado" } }),
      then: async (resolve: any) => resolve({ data: [], error: null }),
    }

    return {
      from: () => ({
        select: () => mockQueryBuilder,
        insert: () => ({
          select: () => mockQueryBuilder,
          then: async (resolve: any) => resolve({ data: null, error: { message: "Supabase não configurado" } }),
        }),
        update: () => ({
          eq: () => mockQueryBuilder,
        }),
        delete: () => ({
          eq: () => mockQueryBuilder,
        }),
      }),
      rpc: () => mockQueryBuilder,
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
      select: (columns = "*") => {
        const queryParams: Record<string, string> = {}

        const buildUrl = () => {
          const cleanColumns = columns.replace(/\s+/g, "")
          const params = new URLSearchParams({ select: cleanColumns, ...queryParams })
          return `${supabaseUrl}/rest/v1/${table}?${params.toString()}`
        }

        const queryBuilder = {
          eq: (column: string, value: any) => {
            queryParams[column] = `eq.${value}`
            return queryBuilder // Retorna o próprio queryBuilder para permitir encadeamento
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            const ascending = options?.ascending !== false
            queryParams.order = `${column}.${ascending ? "asc" : "desc"}`
            return queryBuilder // Retorna o próprio queryBuilder para permitir encadeamento
          },
          limit: (count: number) => {
            queryParams.limit = String(count)
            return queryBuilder // Retorna o próprio queryBuilder para permitir encadeamento
          },
          async then(resolve: any) {
            const url = buildUrl()
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
          single: async () => {
            const url = buildUrl()
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
            const url = buildUrl()
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
        }

        return queryBuilder
      },
      insert: (values: any) => ({
        select: (columns = "*") => ({
          single: async () => {
            const cleanColumns = columns.replace(/\s+/g, "")
            const params = new URLSearchParams({ select: cleanColumns })
            const url = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`
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
            const cleanColumns = columns.replace(/\s+/g, "")
            const params = new URLSearchParams({ select: cleanColumns })
            const url = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`
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
        upload: async (path: string, file: File, options?: { cacheControl?: string; upsert?: boolean }) => {
          const url = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`

          const formData = new FormData()
          formData.append("", file)

          const headers: Record<string, string> = {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          }

          if (options?.cacheControl) {
            headers["cache-control"] = options.cacheControl
          }

          if (options?.upsert) {
            headers["x-upsert"] = "true"
          }

          const response = await fetch(url, {
            method: "POST",
            headers,
            body: file,
          })

          if (!response.ok) {
            const error = await response.json()
            return { data: null, error }
          }

          const data = await response.json()
          return { data: { path, ...data }, error: null }
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
