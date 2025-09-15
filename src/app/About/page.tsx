import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">About Us</h1>
          <p className="text-lg text-gray-400">
            Learn more about our journey and what drives us.
          </p>
        </div>

        {/* Mission Section */}
        <section>
          <h2 className="text-2xl font-semibold text-purple-400 mb-3">Our Mission</h2>
          <p>
            Our mission is to provide high-quality products at unbeatable prices
            while offering a seamless shopping experience. We are dedicated to
            empowering our customers with choices that fit their needs and
            lifestyle.
          </p>
        </section>

        {/* Story Section */}
        <section>
          <h2 className="text-2xl font-semibold text-purple-400 mb-3">Our Story</h2>
          <p>
            We started as a small team passionate about technology and innovation.
            Over the years, we have grown into a trusted online store with a wide
            range of products, serving customers worldwide. Our commitment to
            quality and customer satisfaction has always been at the heart of
            everything we do.
          </p>
        </section>

        {/* Values Section */}
        <section>
          <h2 className="text-2xl font-semibold text-purple-400 mb-3">Our Values</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Customer-first approach</li>
            <li>High-quality and affordable products</li>
            <li>Innovation and continuous improvement</li>
            <li>Transparency and trust</li>
          </ul>
        </section>

        {/* Call to Action */}
        <div className="text-center mt-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to explore our products?
          </h2>
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
