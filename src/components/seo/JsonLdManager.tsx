import React, { useEffect } from 'react';
import { Business } from '../../types';
import { formatKenyanPhoneForWhatsApp } from '../../lib/phoneUtils';

interface JsonLdManagerProps {
  activeBusiness?: Business | null;
  activeCategory?: string | null;
  activeZone?: string | null;
}

const DEFAULT_TITLE = 'Kahawa West Directory | www.kahawawestdirectory.co.ke';
const DEFAULT_DESC =
  'Find trusted Kahawa West businesses, domestic specialists, verified local contacts, emergency hotlines, and estate updates in one community directory.';

function getLocalBusinessType(category?: string): string {
  switch (category) {
    case 'food-dining':
      return 'Restaurant';
    case 'healthcare-chemists':
      return 'Pharmacy';
    case 'groceries-produce':
      return 'GroceryStore';
    case 'hardware-building':
      return 'HardwareStore';
    case 'salons-beauty':
      return 'BeautySalon';
    case 'automotive-mechanics':
      return 'AutoRepair';
    case 'cyber-services':
    case 'professional-services':
      return 'ProfessionalService';
    default:
      return 'LocalBusiness';
  }
}

export const JsonLdManager: React.FC<JsonLdManagerProps> = ({
  activeBusiness,
  activeCategory,
  activeZone,
}) => {
  useEffect(() => {
    // ID for dynamic JSON-LD tag
    const SCRIPT_ID = 'kwest-dynamic-jsonld';
    let scriptTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = SCRIPT_ID;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (activeBusiness) {
      // 1. Dynamic LocalBusiness Schema
      const bizType = getLocalBusinessType(activeBusiness.category);
      const bizUrl = `https://www.kahawawestdirectory.co.ke/?biz=${encodeURIComponent(
        activeBusiness.slug || activeBusiness.id
      )}`;
      const cleanWa = formatKenyanPhoneForWhatsApp(activeBusiness.whatsapp || activeBusiness.phone);
      const sameAs: string[] = [];

      if (cleanWa) {
        sameAs.push(`https://wa.me/${cleanWa}`);
      }
      if (activeBusiness.socialLinks?.facebook) sameAs.push(activeBusiness.socialLinks.facebook);
      if (activeBusiness.socialLinks?.instagram) sameAs.push(activeBusiness.socialLinks.instagram);
      if (activeBusiness.website) sameAs.push(activeBusiness.website);

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': bizType,
        '@id': bizUrl,
        name: activeBusiness.name,
        description:
          activeBusiness.description ||
          activeBusiness.tagline ||
          `${activeBusiness.name} is a verified local service provider in ${activeBusiness.zone}, Kahawa West.`,
        url: bizUrl,
        image: activeBusiness.heroImage || 'https://www.kahawawestdirectory.co.ke/hero.jpg',
        telephone: activeBusiness.phone || undefined,
        priceRange: '$$',
        currenciesAccepted: 'KES',
        paymentAccepted: 'Cash, Lipa Na M-Pesa',
        areaServed: {
          '@type': 'AdministrativeArea',
          name: 'Kahawa West, Roysambu, Nairobi',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: activeBusiness.landmark
            ? `${activeBusiness.landmark}, ${activeBusiness.zone}`
            : activeBusiness.zone,
          addressLocality: 'Kahawa West',
          addressRegion: 'Nairobi',
          postalCode: '00609',
          addressCountry: 'KE',
        },
        sameAs: sameAs.length > 0 ? sameAs : undefined,
      };

      scriptTag.textContent = JSON.stringify(jsonLd, null, 2);

      // Update Head Metadata for OpenGraph and Title
      document.title = `${activeBusiness.name} - ${activeBusiness.zone}, Kahawa West | Directory`;

      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) {
        descMeta.setAttribute(
          'content',
          `${activeBusiness.name} in ${activeBusiness.zone}, Kahawa West. Phone: ${activeBusiness.phone}. ${activeBusiness.tagline || ''}`
        );
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${activeBusiness.name} - Kahawa West Directory`);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute(
          'content',
          activeBusiness.tagline || activeBusiness.description || DEFAULT_DESC
        );
      }

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', bizUrl);

      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg && activeBusiness.heroImage) {
        ogImg.setAttribute('content', activeBusiness.heroImage);
      }
    } else {
      // 2. Directory Collection Page Schema (Category/Zone filter or Home)
      let title = DEFAULT_TITLE;
      let desc = DEFAULT_DESC;

      if (activeCategory && activeZone) {
        title = `${activeCategory} in ${activeZone} | Kahawa West Directory`;
        desc = `Browse verified ${activeCategory} businesses and specialists in ${activeZone}, Kahawa West.`;
      } else if (activeCategory) {
        title = `${activeCategory} in Kahawa West | Verified Local Directory`;
        desc = `Find top-rated ${activeCategory} providers, shops, and fundis in Kahawa West, Nairobi.`;
      } else if (activeZone) {
        title = `Businesses in ${activeZone}, Kahawa West | Local Directory`;
        desc = `Directory of verified shops, services, and domestic specialists operating in ${activeZone}, Kahawa West.`;
      }

      document.title = title;

      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', desc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', 'https://www.kahawawestdirectory.co.ke');

      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', 'https://www.kahawawestdirectory.co.ke/kwest-logo.png');

      const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description: desc,
        url: 'https://www.kahawawestdirectory.co.ke',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Kahawa West Directory',
          url: 'https://www.kahawawestdirectory.co.ke',
        },
      };

      scriptTag.textContent = JSON.stringify(collectionSchema, null, 2);
    }

    return () => {
      // Cleanup on unmount
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
      document.title = DEFAULT_TITLE;
    };
  }, [activeBusiness, activeCategory, activeZone]);

  return null;
};
