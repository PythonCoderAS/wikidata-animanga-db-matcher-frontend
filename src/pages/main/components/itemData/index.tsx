import { ClaimSnakEntityValue } from "@entitree/helper";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import {
  InstanceMapping,
  ItemType,
  instanceOfProperty,
} from "../../../../common/constants";
import ItemTypeChoices from "./components/itemTypeChoices";
import LabelTable from "./components/labelTable";
import { ItemData } from "./onsubmit";

export interface ItemDataProps {
  itemData: ItemData;
}

export function determineItemType(itemData: ItemData): Set<ItemType> {
  return new Set<ItemType>(
    // Gets the instance of claims
    (itemData.claims?.[instanceOfProperty] ?? [])
      // For each claim, gets the target item.
      .map((val) => (val.mainsnak.datavalue as ClaimSnakEntityValue).value.id)
      // For each value, searches the list of matching item type instances to see if the item is one of them.
      .map((val) => {
        // For every item type and array of possible values, we want to see if the value is in the array.
        return [...InstanceMapping.entries()].find(
          ([, v]) => v.includes(val)
          // We only care about the first match, so we can stop searching.
        )?.[0] as ItemType; // Actually, there are some `undefined`s in the array, but the next filter step gets rid of them.
      })
      .filter((val) => val !== undefined)
  );
}

export default function ItemDataComponent(props: ItemDataProps) {
  const [itemType, setItemType] = useState<Set<ItemType>>(
    determineItemType(props.itemData)
  );
  return (
    <div>
      <Typography variant="h5">{props.itemData.id}</Typography>
      <ItemTypeChoices itemType={itemType} setItemType={setItemType} />
      <LabelTable itemData={props.itemData} />
    </div>
  );
}
