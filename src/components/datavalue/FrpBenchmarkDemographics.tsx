import { ModalsProvider } from "@mantine/modals";
import { SI1TableGridEditor } from "./SI1TableGridEditor.tsx";


export const FrpBenchmarkDemographics = () => {
  return (
    <ModalsProvider>
      <SI1TableGridEditor siflag="I"/>
    </ModalsProvider>
  )
};
