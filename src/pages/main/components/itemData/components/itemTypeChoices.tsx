import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import { ItemType } from "../../../../../common/constants";

export interface ItemTypeChoicesProps {
  itemType: Set<ItemType>;
  setItemType: (itemType: Set<ItemType>) => void;
}

export default function itemTypeChoices(props: ItemTypeChoicesProps) {
  return (
    <div>
      <FormGroup row={true}>
        <Typography
          variant="h6"
          sx={{ display: "inline-block", paddingRight: "15px" }}
        >
          Search Databases:
        </Typography>
        <FormControlLabel
          control={
            <Switch
              onChange={(ev) => {
                if (ev.target.checked) {
                  props.itemType.add(ItemType.anime);
                } else {
                  props.itemType.delete(ItemType.anime);
                }
                props.setItemType(new Set(props.itemType));
              }}
            />
          }
          checked={props.itemType.has(ItemType.anime)}
          label="Anime"
        ></FormControlLabel>
        <FormControlLabel
          control={
            <Switch
              onChange={(ev) => {
                if (ev.target.checked) {
                  props.itemType.add(ItemType.manga);
                } else {
                  props.itemType.delete(ItemType.manga);
                }
                props.setItemType(new Set(props.itemType));
              }}
            />
          }
          checked={props.itemType.has(ItemType.manga)}
          label="Manga"
        ></FormControlLabel>
      </FormGroup>
    </div>
  );
}
