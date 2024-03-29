import { WikibaseEntity, getWikidataEntities } from "@entitree/helper";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState } from "react";

import Header from "../../common/header";
import {
  hashTitles,
} from "../../common/utils";
import { Operation, Operations, doOp } from "../../common/wikidata";
import DatabaseResults from "./components/databaseResults";
import ItemDataComponent, { Result1 } from "./components/itemData";
import onSubmit, { ItemData } from "./components/itemData/onsubmit";
import mainStyles from "./index.module.css";

export default function Main() {
  const [itemVal, updateItemVal] = useState("");
  const [error, updateError] = useState(false);
  const [errorText, updateErrorText] = useState("");
  const [spin, updateSpin] = useState(false);
  const [itemGetError, updateItemGetError] = useState("");
  const [itemData, updateItemData] = useState<ItemData | null>(null);
  const [result1, updateResult1] = useState<Result1 | null>(null);
  const [newPropValues, updateNewPropValues] = useState<Record<string, string>>(
    {}
  );
  const [editSpin, updateEditSpin] = useState(false);
  const [editProgress, updateEditProgress] = useState(0);
  const [editBuffer, updateEditBuffer] = useState(0);
  const loggedIn = sessionStorage.getItem("username") !== null;
  const setNewPropValues = (property: number, value: string | null) => {
    const propString = `P${property}`;
    if (value === null) {
      delete newPropValues[propString];
    } else {
      if (
        (itemData?.claims![propString] ?? [])
          .map((claim) => claim.mainsnak.datavalue!.value as unknown as string)
          .includes(value)
      ) {
        delete newPropValues[propString];
      } else {
        newPropValues[propString] = value;
      }
    }
    updateNewPropValues({ ...newPropValues });
  };
  return (
    <div className={mainStyles.mainPart}>
      <Header />
      <form
        onSubmit={(ev) =>
          onSubmit(
            ev,
            itemVal,
            { updateError, updateErrorText },
            { updateSpin, updateItemGetError, updateItemData },
            { updateResult1, updateNewPropValues, updateEditSpin }
          )
        }
        noValidate={true}
        id="item-form"
      >
        <div style={{ marginBottom: 10, display: "flex" }}>
          <div className={mainStyles.itemLabelInput}>
            {error ? (
              <TextField
                required
                error
                id="item-label-input"
                label="Item Label"
                variant="filled"
                value={itemVal}
                onChange={(e) => updateItemVal(e.target.value)}
                helperText={errorText}
              />
            ) : (
              <TextField
                required
                id="item-label-input"
                label="Item Label"
                variant="filled"
                value={itemVal}
                onChange={(e) => updateItemVal(e.target.value)}
              />
            )}
          </div>
          <Alert severity="info" sx={{ display: "inline-flex", flexGrow: 1 }}>
            Enter the item # of the item you want to import DB info for. The Q
            in front is optional.
          </Alert>
        </div>
        <LoadingButton
          variant="contained"
          endIcon={<SearchIcon />}
          type="submit"
          loading={spin}
        >
          Fetch Item Info
        </LoadingButton>
      </form>
      {itemGetError || itemData ? (
        <div id="result-1">
          {itemGetError ? (
            <Alert severity="error">{itemGetError}</Alert>
          ) : itemData ? (
            <ItemDataComponent
              itemData={itemData!}
              setResult1={updateResult1}
              updateEditSpin={updateEditSpin}
              updateNewPropValues={updateNewPropValues}
            />
          ) : undefined}
        </div>
      ) : undefined}
      {result1 != null ? (
        <>
          <div id="result-2">
            {[...result1.databases].map((database) => (
              <DatabaseResults
                itemData={itemData!}
                titles={result1.titles}
                type={database}
                key={`${database}-${hashTitles(result1.titles)}`}
                setNewPropValues={setNewPropValues}
              />
            ))}
          </div>
          <div>
            <Stack spacing={1}>
              {!loggedIn ? (
                <Alert severity="warning">
                  Please log in to make edits to Wikidata.
                </Alert>
              ) : Object.values(newPropValues).length === 0 ? (
                <Alert severity="warning">
                  Please select some new values to make edits. Selecting an
                  already existing value will not result in any edits.
                </Alert>
              ) : (
                <Alert severity="info">
                  Please review the edits before submitting.
                </Alert>
              )}
              {editSpin && (
                <LinearProgress
                  variant="buffer"
                  value={editProgress}
                  valueBuffer={editBuffer}
                />
              )}
              <LoadingButton
                loading={editSpin}
                endIcon={<EditIcon />}
                variant="contained"
                disabled={
                  Object.values(newPropValues).length === 0 || !loggedIn
                }
                onClick={async () => {
                  if (Object.values(newPropValues).length > 0) {
                    updateEditSpin(true);
                    const opData: Operations[] = [];
                    for (const [prop, value] of Object.entries(newPropValues)) {
                      if (itemData?.claims![prop] === undefined) {
                        opData.push({
                          type: Operation.createClaim,
                          itemId: itemData!.id,
                          data: {
                            property: prop,
                            value,
                          },
                        });
                      } else {
                        const existing = itemData!.claims![prop];
                        if (existing.length === 1) {
                          opData.push({
                            type: Operation.setClaim,
                            itemId: itemData!.id,
                            data: {
                              id: existing[0].id,
                              newValue: value,
                            },
                          });
                        } else {
                          opData.push({
                            type: Operation.setClaim,
                            itemId: itemData!.id,
                            data: {
                              id: existing[0].id,
                              newValue: value,
                            },
                          });
                          for (let i = 1; i < existing.length; i++) {
                            opData.push({
                              type: Operation.deleteClaim,
                              itemId: itemData!.id,
                              data: {
                                id: existing[i].id,
                              },
                            });
                          }
                        }
                      }
                    }
                    for (let i = 0; i < opData.length; i++) {
                      updateEditProgress((i / opData.length) * 100);
                      updateEditBuffer(((i + 1) / opData.length) * 100);
                      await doOp(opData[i]);
                    }
                    const newData = await getWikidataEntities(
                      [itemData!.id],
                      [],
                      ["labels", "aliases", "claims"]
                    );
                    updateItemData(newData[itemData!.id] as WikibaseEntity);
                    updateNewPropValues({});
                    updateEditSpin(false);
                    updateEditProgress(0);
                    updateEditBuffer(0);
                  }
                }}
              >
                Set New Values
              </LoadingButton>
            </Stack>
          </div>
        </>
      ) : undefined}
    </div>
  );
}
