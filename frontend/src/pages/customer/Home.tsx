import Hero from "../../components/home/Hero";
import Philosophy from "../../components/home/Philosophy";
import SignatureMenu from "../../components/home/SignatureMenu";
import CoffeeChapter from "../../components/home/CoffeeChapter";
import MatchaChapter from "../../components/home/MatchaChapter";
import FiloMoment from "../../components/home/FiloMoment";
import Atmosphere from "../../components/home/Atmosphere";
import BrandStory from "../../components/home/BrandStory";
import Social from "../../components/home/Social";
import Location from "../../components/home/Location";
import OpeningSoon from "../../components/home/OpeningSoon";

export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <SignatureMenu />
      <CoffeeChapter />
      <MatchaChapter />
      <FiloMoment />
      <Atmosphere />
      <BrandStory />
      <Social />
      <Location />
      <OpeningSoon />
    </>
  );
}
