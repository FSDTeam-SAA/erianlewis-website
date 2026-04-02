import { AccountDangerZone } from "./account-danger-zone";
import { AccountHeader } from "./account-header";
import { AccountOverviewCard } from "./account-overview-card";
import { ProfileSettingsCard } from "./profile-settings-card";
import { SupportLinksCard } from "./support-links-card";

const AccountContainer = () => {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <AccountHeader />
      <div className="container">
        <AccountOverviewCard />
        <ProfileSettingsCard />
        <SupportLinksCard />
        <AccountDangerZone />
      </div>
    </div>
  );
};

export default AccountContainer;
