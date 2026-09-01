import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full">
      <div className="mx-1 sm:mx-8 lg:mx-16 my-4">
        <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: "var(--hero-ratio, 1.2/1)" }} data-hero>
          <Image
            src="/hero.webp"
            alt="hero"
            fill
            priority
            quality={80}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) calc(100vw - 64px), calc(100vw - 128px)"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
