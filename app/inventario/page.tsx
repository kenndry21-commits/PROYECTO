"use client"

import { useState, useEffect } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  unit: string
}

export default function Inventario() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({
    name: "", description: "", price: "", stock: "", unit: "unidad"
  })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data)
  }

  function startEdit(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      unit: product.unit
    })
    setShowForm(true)
  }

  async function saveProduct() {
    const product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      unit: form.unit
    }
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    })
    setForm({ name: "", description: "", price: "", stock: "", unit: "unidad" })
    setShowForm(false)
    setEditingProduct(null)
    loadProducts()
  }

  async function deleteProduct(id: string) {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" })
    loadProducts()
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📦 Inventario</h1>
              <p className="text-gray-500">Gestión de productos y stock</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditingProduct(null); setForm({ name: "", description: "", price: "", stock: "", unit: "unidad" }) }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Agregar Producto
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">
              {editingProduct ? "✏️ Editar Producto" : "Nuevo Producto"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Nombre del producto" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="border rounded-lg p-2 col-span-2" />
              <input placeholder="Descripción" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="border rounded-lg p-2 col-span-2" />
              <input placeholder="Precio" type="number" value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="border rounded-lg p-2" />
              <input placeholder="Stock disponible" type="number" value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
                className="border rounded-lg p-2" />
              <select value={form.unit}
                onChange={e => setForm({...form, unit: e.target.value})}
                className="border rounded-lg p-2">
                <option value="unidad">Unidad</option>
                <option value="galon">Galón</option>
                <option value="litro">Litro</option>
                <option value="kg">Kilogramo</option>
                <option value="caja">Caja</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                {editingProduct ? "Actualizar" : "Guardar"}
              </button>
              <button onClick={() => { setShowForm(false); setEditingProduct(null) }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-gray-600">Producto</th>
                <th className="text-left p-4 text-gray-600">Precio</th>
                <th className="text-left p-4 text-gray-600">Stock</th>
                <th className="text-left p-4 text-gray-600">Unidad</th>
                <th className="text-left p-4 text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-400">
                    {search ? "No se encontraron productos" : "No hay productos. ¡Agrega el primero!"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </td>
                    <td className="p-4">RD${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`font-bold ${product.stock <= 0 ? 'text-red-600' : product.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">{product.unit}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => startEdit(product)}
                        className="text-blue-500 hover:text-blue-700">
                        ✏️ Editar
                      </button>
                      <button onClick={() => deleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700">
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}