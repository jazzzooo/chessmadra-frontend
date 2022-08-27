import { some, map, last, isNil } from "lodash";
import { BrowserDrilldownState } from "app/utils/repertoire_state";

export const getAppropriateEcoName = (
  fullName: string,
  browserStates?: BrowserDrilldownState[]
): [string, string[]] => {
  if (!fullName) {
    return null;
  }
  console.log("Getting appropriate name for ", fullName);
  let name = fullName.split(":")[0];
  let isFirstTimeSeeing =
    isNil(browserStates) ||
    !some(browserStates, (s) => {
      return s.ecoCode?.fullName.split(":")[0] == name;
    });

  let variations = map(fullName.split(":")?.[1]?.split(","), (s) => s.trim());
  if (isFirstTimeSeeing) {
    return [name, variations];
  } else {
    return [last(variations) ?? name, null];
  }
};

export const getNameEcoCodeIdentifier = (fullName: string): string => {
  return getAppropriateEcoName(fullName)[0];
};

export const getVariationEcoCodeIdentifier = (fullName: string): string => {
  return getAppropriateEcoName(fullName)[1]?.[1];
};
