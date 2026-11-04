import CategoriesSection from '../../components/home/CategoriesSection'
import BenefitsSection from '../../components/home/BenefitsSection'
import CustomizationSection from '../../components/home/CustomizationSection'
import FeaturedProductsSection from '../../components/home/FeaturedProductsSection'
import HeroSection from '../../components/home/HeroSection'

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      <CategoriesSection />

      <FeaturedProductsSection />

      <CustomizationSection />

      <BenefitsSection />
    </main>
  )
}
