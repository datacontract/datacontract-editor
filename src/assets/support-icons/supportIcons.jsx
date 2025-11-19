// Support channel icons - imports SVG files for all support tool types with fallback to other.svg

// Import SVG files as URLs
import EmailIcon from './email.svg';
import SlackIcon from './slack.svg';
import TeamsIcon from './teams.svg';
import DiscordIcon from './discord.svg';
import TicketIcon from './ticket.svg';
import GoogleChatIcon from './googlechat.svg';
import OtherIcon from './other.svg';

// Wrapper component to render SVG as img tag with consistent styling
const IconWrapper = ({ src }) => <img src={src} className="w-5 h-5" alt="" />;

// Map support tool types to their icon components with other.svg as fallback
const supportIcons = {
  email: () => <IconWrapper src={EmailIcon} />,
  slack: () => <IconWrapper src={SlackIcon} />,
  teams: () => <IconWrapper src={TeamsIcon} />,
  discord: () => <IconWrapper src={DiscordIcon} />,
  ticket: () => <IconWrapper src={TicketIcon} />,
  googlechat: () => <IconWrapper src={GoogleChatIcon} />,
  other: () => <IconWrapper src={OtherIcon} />,
};

// Export function that returns icon component with fallback to other.svg
export default new Proxy(supportIcons, {
  get(target, prop) {
    // If the requested icon exists, return it
    if (prop in target) {
      return target[prop];
    }
    // Otherwise, return the other fallback icon
    return target.other;
  }
});
