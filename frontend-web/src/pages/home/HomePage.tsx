import Header from '../../components/common/Header'
import CategoriesSection from '../../components/home/CategoriesSection'
import BenefitsSection from '../../components/home/BenefitsSection'
import CustomizationSection from '../../components/home/CustomizationSection'
import FeaturedProductsSection from '../../components/home/FeaturedProductsSection'
import Footer from '../../components/common/Footer'
import HeroSection from '../../components/home/HeroSection'

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSection />

        <CategoriesSection />

        <FeaturedProductsSection />

        <CustomizationSection />

        <BenefitsSection />
      </main>

      <Footer />
    </>
  )
}
