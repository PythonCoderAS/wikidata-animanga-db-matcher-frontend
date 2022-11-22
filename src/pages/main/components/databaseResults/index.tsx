import Typography from "@mui/material/Typography";

import { ItemType, ProviderData } from "../../../../common/constants";
import { hashTitles } from "../../../../common/utils";
import { ItemData } from "../itemData/onsubmit";
import ProviderResults from "./providerResults";

export interface DatabaseResultsProps {
  titles: Set<string>;
  type: ItemType;
  itemData: ItemData;
  setNewPropValues: (property: number, value: string | null) => unknown;
}

export default function databaseResults(props: DatabaseResultsProps) {
  return (
    <div>
      <Typography variant="h5">{props.type}</Typography>
      {ProviderData.get(props.type)!.map((provider) => (
        <div key={`${provider.id}-${hashTitles(props.titles)}`}>
          <Typography variant="h6">{provider.title}</Typography>
          <ProviderResults
            provider={provider}
            titles={props.titles}
            existingData={props.itemData.claims![`P${provider.property}`]}
            setNewPropValues={props.setNewPropValues}
          />
        </div>
      ))}
    </div>
  );
}
