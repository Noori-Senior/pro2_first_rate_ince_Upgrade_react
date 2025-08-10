import { ModalsProvider } from "@mantine/modals";
import { SI1TableGridEditor } from "./SI1TableGridEditor.tsx";


export const FrpSectorDemographics = () => {
  return (
    <ModalsProvider>
      <SI1TableGridEditor siflag='S'/>
    </ModalsProvider>
  )
};
