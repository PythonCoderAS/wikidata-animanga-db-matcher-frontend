import { Claim } from "@entitree/helper";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Alert, CircularProgress, Link } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { useState } from "react";

import { Provider } from "../../../../common/constants";

export interface ProviderResultsProps {
  existingData: Claim[];
  provider: Provider;
  titles: Set<string>;
}

export type MatchedIDs = Record<string, string>;

export interface Row {
  id: string;
  title: string;
  link?: typeof Link;
  existing?: JSX.Element;
}

export default function providerResults(props: ProviderResultsProps) {
  // results is a map of IDs to display titles.
  const [results, updateResults] = useState<MatchedIDs | null>(null);
  const [error, updateError] = useState<string | null>(null);
  if (results === null && error === null) {
    navigator.locks.request(props.provider.id, async () => {
      if (!(results === null && error === null)) {
        return null;
      }
      await fetch(`/api/getResults`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: props.provider.id,
          titles: [...props.titles],
        }),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error(`HTTP ${res.status} while fetching results.`);
          }
        })
        .then((json) => updateResults(json))
        .catch((err) => {
          updateError(err);
        });
    });
    return <CircularProgress />;
  } else if (error !== null) {
    return <Alert severity="error">{error.toString()}</Alert>;
  } else {
    // Workaround needed until https://github.com/codeledge/entitree-monorepo/pull/25 is merged.
    const existingIDs: Set<string> = new Set(
      props.existingData.map(
        (val) => val.mainsnak.datavalue!.value as unknown as string
      )
    );
    const cols: GridColDef<Row>[] = [
      {
        field: "id",
        headerName: "External ID",
        flex: 1,
        sortable: true,
      },
      { field: "title", headerName: "Name", flex: 1, sortable: true },
      {
        field: "link",
        headerName: "Link",
        renderCell(params) {
          return (
            <Link
              href={props.provider.format.replace("$1", params.row.id)}
              target="_blank"
              underline="hover"
            >
              Open <OpenInNewIcon fontSize="inherit" />
            </Link>
          );
        },
      },
      {
        field: "existing",
        headerName: "Already Exists",
        width: 150,
        renderCell(params) {
          return (
            <span
              style={{
                color: existingIDs.has(params.row.id) ? "green" : "red",
              }}
            >
              {existingIDs.has(params.row.id) ? "Yes" : "No"}
            </span>
          );
        },
      },
    ];
    const rows: Row[] = Object.entries(results!).map(([id, title]) => ({
      id,
      title,
    }));
    return (
      <DataGrid
        rows={rows}
        columns={cols}
        autoHeight
        onSelectionModelChange={(rows) => console.log(rows)}
      />
    );
  }
}
