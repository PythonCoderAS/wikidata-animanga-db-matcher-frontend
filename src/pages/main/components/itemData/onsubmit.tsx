import { WikibaseEntity, getWikidataEntities } from "@entitree/helper";
import { FormEvent } from "react";

export type ItemData = WikibaseEntity;

export interface ErrorState {
  updateError: (val: boolean) => unknown;
  updateErrorText: (val: string) => unknown;
}

export interface ItemDataState {
  updateSpin: (val: boolean) => unknown;
  updateItemGetError: (val: string) => unknown;
  updateItemData: (val: ItemData) => unknown;
}

interface ResetOtherState {
  updateResult1: (val: null) => unknown;
  updateNewPropValues: (val: Record<string, string>) => unknown;
  updateEditSpin: (val: boolean) => unknown;
}

export default function onSubmit(
  event: FormEvent<HTMLFormElement>,
  itemVal: string,
  error: ErrorState,
  itemData: ItemDataState,
  reset: ResetOtherState
) {
  console.log(itemVal);
  event.preventDefault();
  if (itemVal === "") {
    error.updateError(true);
    error.updateErrorText("Item label cannot be empty.");
  } else if (!itemVal.match(/^Q?\d+$/i)) {
    error.updateError(true);
    error.updateErrorText("Invalid Item ID.");
  } else {
    error.updateError(false);
    const itemNum = itemVal.match(/\d+/)![0];
    itemData.updateSpin(true);
    getWikidataEntities([`Q${itemNum}`], [], ["labels", "aliases", "claims"])
      .then((item) => {
        console.log(item[`Q${itemNum}`]);
        if (item[`Q${itemNum}`] === undefined) {
          itemData.updateItemGetError("Item not found.");
        } else {
          itemData.updateItemData(item[`Q${itemNum}`] as WikibaseEntity);
        }
      })
      .catch((err) => itemData.updateItemGetError(err))
      .finally(() => {
        itemData.updateSpin(false);
        reset.updateResult1(null);
        reset.updateNewPropValues({});
        reset.updateEditSpin(false);
      });
  }
  return;
}
