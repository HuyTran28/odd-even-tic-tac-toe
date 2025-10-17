import { Switch, FormControlLabel, FormGroup } from '@mui/material';
import styles from './ToggleMode.module.css';

export default function ToggleMode({mode, setMode}) {
    const handleChange = (event) => {
        const newMode = event.target.checked ? "hard" : "easy";
        setMode(newMode);
    }

    return (
        <FormGroup className={styles.ToggleModeGroup}>
            <FormControlLabel 
                control={
                    <Switch
                        checked={mode === "hard"}
                        onChange={handleChange}
                    />
                } 
                label={mode === "easy" ? "Easy" : "Hard"}
            />
        </FormGroup>
    )
}