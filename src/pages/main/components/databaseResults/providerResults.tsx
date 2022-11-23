import { Claim } from "@entitree/helper";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Alert, Chip, CircularProgress, Link, Stack } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { useState } from "react";

import { Provider } from "../../../../common/constants";

export interface ProviderResultsProps {
  existingData?: Claim[];
  provider: Provider;
  titles: Set<string>;
  setNewPropValues: (property: number, value: string | null) => unknown;
}

export interface ResultItem {
  title: string;
  nsfw?: boolean;
  urlOverride?: string;
}

export type MatchedIDs = Record<string, ResultItem>;

export interface Row {
  id: string;
  title?: JSX.Element;
  data: ResultItem;
  link?: typeof Link;
}

export default function providerResults(props: ProviderResultsProps) {
  // results is a map of IDs to display titles.
  const [results, updateResults] = useState<MatchedIDs | null>(null);
  const [error, updateError] = useState<string | null>(null);
  if (results === null && error === null) {
    navigator.locks.request(
      props.provider.id,
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          return;
        }
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
      }
    );
    return <CircularProgress />;
  } else if (error !== null) {
    return <Alert severity="error">{error.toString()}</Alert>;
  } else {
    // Workaround needed until https://github.com/codeledge/entitree-monorepo/pull/25 is merged.
    const existingIDs: Set<string> = new Set(
      (props.existingData ?? []).map(
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
      {
        field: "title",
        headerName: "Name",
        flex: 1,
        sortable: true,
        valueGetter(params) {
          return params.row.data.title;
        },
      },
      {
        field: "link",
        headerName: "Link",
        renderCell(params) {
          return (
            <Link
              href={
                params.row.data.urlOverride ??
                props.provider.format.replace("$1", params.row.id)
              }
              target="_blank"
              underline="hover"
            >
              Open <OpenInNewIcon fontSize="inherit" />
            </Link>
          );
        },
      },
      {
        field: "notices",
        headerName: "Extra",
        flex: 1,
        renderCell(params) {
          return (
            <Stack spacing={1} direction="row">
              {existingIDs.has(params.row.id) && (
                <Chip color="success" label="Already Exists" size="small" />
              )}
              {params.row.data.nsfw && (
                <Chip color="error" label="NSFW" size="small" />
              )}
            </Stack>
          );
        },
      },
    ];
    const rows: Row[] = Object.entries(results!).map(([id, data]) => ({
      id,
      data,
    }));
    return (
      <DataGrid
        rows={rows}
        columns={cols}
        pageSize={10}
        autoHeight
        onSelectionModelChange={(rows) => {
          if (rows.length === 0) {
            props.setNewPropValues(props.provider.property, null);
          } else {
            props.setNewPropValues(props.provider.property, rows[0].toString());
          }
        }}
      />
    );
  }
}
