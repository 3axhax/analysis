import {useTranslation} from "react-i18next";

export const Logo = () => {
    const {t} = useTranslation()
    return (
        <p className={"logo"}>{t('logo')}</p>
    )
};
