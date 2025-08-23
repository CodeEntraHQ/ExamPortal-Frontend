import defaultProfile from '../assets/profile-default.svg';

export default function ProfilePhoto({ src }) {
  return (
    <img
      src={src || defaultProfile}
      alt="Profile"
      className="object-cover w-8 h-8 border-2 rounded-full border-primary"
    />
  );
}
