import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { ItemDataProps } from "..";

interface Row {
  lang: string;
  type: string;
  name: string;
}

export default function labelTable(props: ItemDataProps) {
  const columns: GridColDef<Row>[] = [
    {
      field: "lang",
      headerName: "Language",
      sortable: true,
      filterable: true,
      width: 150,
    },
    { field: "type", headerName: "Type", sortable: true, filterable: true },
    {
      field: "name",
      headerName: "Name",
      editable: true,
      sortable: true,
      flex: 1,
      filterable: true,
    },
  ];

  const rows: Row[] = [];
  for (const [lang, label] of Object.entries(props.itemData.labels ?? {})) {
    rows.push({ type: "Label", lang, name: label.value });
  }
  for (const [lang, aliases] of Object.entries(props.itemData.aliases ?? {})) {
    for (const alias of aliases) {
      rows.push({ type: "Alias", lang, name: alias.value });
    }
  }

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      checkboxSelection
      autoHeight
      initialState={{
        sorting: { sortModel: [{ field: "lang", sort: "asc" }] },
      }}
      getRowId={(row) => `${row.lang}-${row.type}-${row.name}`}
    />
  );
}
