import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const UseHistory = () => {
  const { id } = useParams();
  const [useHistory, setUseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    const fetchUseHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/roomies/projects/${id}/historial`);
        setUseHistory(response.data);
      } catch (err) {
        setError('Error al obtener el historial de uso.');
      } finally {
        setLoading(false);
      }
    };

    fetchUseHistory();
  }, [id]);

  const columns = useMemo(() => [
    { header: 'Producto', accessorKey: 'nombre' },
    {
      header: 'Subproyecto',
      accessorFn: row => row.subproyecto_nombre || 'Proyecto Principal',
      id: 'subproyecto',
    },
    {
      header: 'Fecha de Uso',
      accessorKey: 'fecha',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    },
    { header: 'Cantidad Usada', accessorKey: 'cantidad' },
    { header: 'Correo', accessorKey: 'correo' },
  ], []);

  const table = useReactTable({
    data: useHistory,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = () => {
    // Preparar los datos
    const dataToExport = useHistory.map(row => ({
      Producto: row.nombre,
      Subproyecto: row.subproyecto_nombre || 'Proyecto Principal',
      'Fecha de Uso': new Date(row.fecha).toLocaleDateString(),
      'Cantidad Usada': row.cantidad,
      Correo: row.correo,
    }));

    // Crear hoja
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Uso');

    // Generar y guardar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'historial_uso.xlsx');
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Historial de Uso de Productos</h1>
        <button className="btn btn-success" onClick={handleExport}>Descargar</button>
      </div>

      <table className="table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: 'pointer' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr><td colSpan="5">No hay registros de uso.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UseHistory;
