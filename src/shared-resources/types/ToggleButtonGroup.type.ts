export interface ToggleButtonGroupProps {
  options: string[];
  selectedValue: string;
  setSelectedValue: (selectedValue?: string) => void;
  error?: string;
  styles?: any;
}
