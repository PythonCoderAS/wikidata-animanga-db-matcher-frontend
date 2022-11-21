import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import { useState } from "react";

import Header from "../../common/header";
import { hashTitles } from "../../common/utils";
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
  return (
    <div className={mainStyles.mainPart}>
      <Header />
      <form
        onSubmit={(ev) =>
          onSubmit(
            ev,
            itemVal,
            { updateError, updateErrorText },
            { updateSpin, updateItemGetError, updateItemData }
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
            />
          ) : undefined}
        </div>
      ) : undefined}
      {result1 != null ? (
        <div id="result-2">
          {[...result1.databases].map((database) => (
            <DatabaseResults
              itemData={itemData!}
              titles={result1.titles}
              type={database}
              key={`${database}-${hashTitles(result1.titles)}`}
            />
          ))}
        </div>
      ) : undefined}
    </div>
  );
}
