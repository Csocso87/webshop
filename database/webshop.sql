-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 26. 19:43
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `webshop`
--
CREATE DATABASE IF NOT EXISTS `webshop` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `webshop`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Okostelefon', 'Okostelefon', '2026-04-26 17:09:29'),
(2, 'Tablet', 'Tablet', '2026-04-26 17:09:36'),
(3, 'Laptop', 'Laptop', '2026-04-26 17:09:43'),
(4, 'Fülhallgató', 'Fülhallgató', '2026-04-26 17:24:32'),
(5, 'Kontroller', 'Kontroller', '2026-04-26 17:28:02');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` int(11) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shipping_name` varchar(100) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_zip` varchar(20) DEFAULT NULL,
  `shipping_country` varchar(100) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_url`, `category_id`, `created_at`) VALUES
(1, 'APPLE IPHONE 17 PRO 256 GB Ezüst Kártyafüggetlen Okostelefon', '<h3><strong>Ettől olyan nagyszerű.</strong></h3><ul><li>Kivételesen profi képességeket rejtő hőformázott alumínium unibody ház.</li><li>A19 Pro chip, párahűtés a villámgyors működésért. Lélegzetelállító üzemidő.</li><li>Tökéletes profi kamerarendszer. 48 MP Fusion hátoldali kamerák. Az eddigi legnagyobb zoom az iPhone történetében.</li><li>Új Center Stage előlapi kamera. Rugalmas lehetőségek a felvételeid megkomponálására. Intelligensebb csoportszelfik. És még rengeteg más.</li><li>iOS 26. Új látványvilág. Még több csodás élmény.</li><li>Apple Intelligence. Könnyed és hasznos funkciók – képgenerálástól az Élő fordításig. (Csak bizonyos nyelveken érhető el.)</li></ul><p><br></p><h3><strong>Dizájn. Unibody ház. Megdöbbentően erős dizájn.</strong></h3><p>Az új iPhone 17 Prot és iPhone 17 Pro Maxot kívül-belül arra terveztük, hogy erejükkel minden eddigi iPhone-modellt felül­múljanak. Az új kiala­kí­tás központi eleme a hő­formázott alumínium unibody ház, amely maximális teljesít­ményt, akkumulátor­kapacitást és strapa­bírást tesz lehetővé.</p><p><br></p><h3><strong>Kamerák. Zoomolj a jövőbe.</strong></h3><ul><li>Az iPhone 17 Pro kamerarendszerébe számos jövőbe mutató innovációt építettünk. Közéjük tartozik a telefotó az új generációs tetraprizmás optikával és az 56 százalékkal nagyobb érzékelővel. Ez a telefotó az iPhone történetében az eddigi legnagyobb, a 200 mm-esnek megfelelő fókusztávolsággal és a 8x os optikai minőségű zoom¬mal, ami összességében 16x os optikai zoomtartományt tesz lehetővé. Így még kreatívabban komponálhatsz csodás felvételeket akár nagyobb távolságból is.</li></ul>', 549999, 30, 'http://localhost/webshop/backend/uploads/69ee473c8a137.jpeg', 1, '2026-04-26 17:11:24'),
(2, 'APPLE iPad (A16) 128 GB WIFI Ezüst', '<ul><li>A fekvő tájolású előlapi kamerával és a Rivaldafény funkcióval természetesebb élmény minden video­hívás. A Wi‑Fi 6‑nak és az 5G‑nek köszönhetően pedig kapcsolatban maradhatsz munka­társaiddal és szeretteiddel.</li><li>11 hüvelykes Liquid Retina kijelző</li><li>A Magic Keyboard Folión kényelmesen gépelhetsz, és megoldhatod vele a nagy precizitást igénylő feladatokat. Az Apple Pencillel pedig firkálgathatsz, jegyzetelhetsz, és jelölgethetsz a dokumentumokon.</li></ul>', 154999, 15, 'http://localhost/webshop/backend/uploads/69ee484b35cce.jpeg', 2, '2026-04-26 17:15:55'),
(3, 'ASUS TUF Gaming A16 FA607NUG-RL117 Szürke Gamer laptop', '<p><strong>Finom kialakítás</strong></p><p>A 2024 TUF Gaming A16 megtartja a klasszikus TUF stílusát, néhány új elemmel kiegészítve. A Mecha Gray változat dombornyomott TUF logót visel, míg a Jaeger Gray kiadások stílusos lézergravírozott logót kaptak. Négy kis háromszög keretezi a fedél sarkait, a billentyűzetfedélen és a trackpadon pedig finom TUF-utalások jelennek meg.</p><p><strong>Készen áll bármire</strong></p><p>Merülj el a játékban és az alkotásban Windows 11 alatt az AMD Ryzen™ 9 7845HX processzorral és akár NVIDIA® GeForce RTX™ 4070 laptop GPU-val, amely támogatja az NVIDIA® Advanced Optimus-t. A 2024 TUF Gaming A16 nagy sebességű DDR5-5200 MHz-es RAM-mal és két PCIe Gen 4x4 M.2 SSD foglalattal is rendelkezik, amelyek mindegyike könnyen hozzáférhető a jövőbeli frissítésekhez és bővítésekhez.</p><p><strong>Magával ragadó látvány</strong></p><p>A jövő világos. A TUF Gaming A16 2024 akár 2,5K felbontású, 165Hz/3ms kijelzővel és G-SYNC-kel rendelkezik a hihetetlen játékélményért. Akár a gyorsabb tempójú lövöldözős, akár a lassabb kalandjátékokat kedveled, a 16:10 képarányú kijelző és a 90%-os képernyő-test arányú, vékony keretek páratlan beleéléssel rántanak bele az akcióba.</p><p><strong>Kitartás</strong></p><p>Ha útközben kell játszanod vagy dolgoznod, a TUF Gaming A16 2024 több mint elegendő energiával rendelkezik a munka elvégzéséhez. A nagyméretű, 90 Wh-s akkumulátor lehetővé teszi, hogy hosszabb ideig dolgozhass a faltól távol, az USB Type-C töltés pedig rugalmas töltést tesz lehetővé, ha otthon hagytad a tápegységet.</p>', 403999, 21, 'http://localhost/webshop/backend/uploads/69ee4a0c43b7a.jpeg', 3, '2026-04-26 17:23:24'),
(4, 'APPLE AirPods Pro 3 vezeték nélküli MagSafe töltőtokkal, type-C ', '<p><strong>AirPods Pro 3</strong></p><p>Lélegzetelállító hangminőségben lehet részed a korszakalkotó Aktív zajkioltásnak köszönhetően. A fülhallgató beépített pulzusérzékelése segít nyomon követni edzés közben a pulzusodat és az elégetett kalóriákat. Emellett az AirPods Pro 3 hallásegészséggel kapcsolatos fejlesztéseket is nyújt.</p><p><br></p><p>Jobb akusztikus teljesítményét teljesen átalakított belső architektúrájának, biztosabb illeszkedését pedig újratervezett külső geometriájának köszönheti. Hosszabb üzemidejével akár 8 órányi zenehallgatási időt is élvezhetsz Aktív zajkioltással, egyetlen feltöltéssel. Az AirPods Pro 3 az első olyan AirPods, amely IP57‑es minősítésű por-, izzadság- és vízállósággal rendelkezik.</p>', 96999, 18, 'http://localhost/webshop/backend/uploads/69ee4abef1384.jpeg', 4, '2026-04-26 17:26:22'),
(5, 'MICROSOFT Xbox vezeték nélküli kontroller (Carbon Black)', '<p><strong>Emeld új szintre a játékot!</strong></p><p>Élvezd a modernizált Xbox vezeték nélküli kontroller – Carbon Black kiadást, amelynek továbbfejlesztett formája a megnövelt kényelmet szolgálja!</p><p><br></p><p><strong>Egyedi gombkiosztás</strong></p><p>Szabd testre kontrolleredet egyedi gombkiosztással!* Plusz, használj bármilyen kompatibilis headsetet a 3.5mm-es jack csatlakozóval!</p><p><br></p><p><strong>Xbox Wireless és Bluetooth® technológia</strong></p><p>Xbox Wireless és Bluetooth® technológia a vezeték nélküli játékért konzolokon, Windows 10 PC-n és Android telefonokon és táblagépeken.*</p><p><br></p><p><strong>Maradj a célon!</strong></p><p>Maradj a célon a textúrázott ravaszokkal, ütközőgombokkal és markolattal, és az új hibrid d-paddal a pontos, mégis ismerős kezelésért!</p><p><br></p><p><strong>Megosztás gomb</strong></p><p>Rögzíts és ossz meg képeket, videókat és sok mást könnyedén az új Megosztás gombbal!</p><p><br></p><p><strong>Gyors párosítás és váltás</strong></p><p>Párosíts és válts könnyedén Windows 10 PC-k, Xbox Series X, Xbox One és Android telefonok vagy táblagépek között!*</p><p><br></p><p><br></p><p>*A kontroller USB-C csatlakozóval rendelkezik. Csak bizonyos eszközökkel és operációs rendszerekkel kompatibilis. Androidon és Bluetooth-on keresztül bizonyos funkciók nem elérhetők. További információ: xbox.com/controller-compatibility. Az egyedi gombkiosztás az Xbox Accessories alkalmazásban érhető el Xbox Series X, Xbox One és Windows 10 platformokon.</p><p><br></p><p>A Bluetooth® betűtípus és logó a Bluetooth SIG, Inc. védjegye, ezeket a Microsoft Corporation licensz hatálya alatt használja. További védjegyek és nevek a saját tulajdonosaik licensze alatt használatosak.</p>', 26999, 40, 'http://localhost/webshop/backend/uploads/69ee4b9bc5397.jpeg', 5, '2026-04-26 17:30:03'),
(6, 'SONY PlayStation 5 DualSense vezeték nélküli kontroller (White)', '<p><strong>Keltsd életre a játékok világát!</strong></p><p>Kézzel fogható visszajelzés2</p><p>Érezd a játékbeli döntéseid fizikai visszajelzését a duális aktuátorok segítségével, amelyek átveszik a hagyományos rezgőmotorok helyét! A dinamikus rezgések lehetővé teszik, hogy mindent érezz a környezeti viszonyoktól kezdve egészen a fegyverek rúgásáig.</p><p><br></p><p><strong>Adaptív ravasz</strong></p><p>Éld át az erő és feszültség változó szintjeit, amikor a játékon belüli felszerelésedet és környezeteidet használod! Tapasztald meg a képernyőn látottakat a vezérlővel – a pattanásig feszülő íjtól kezdve egészen a padlófékig egy száguldó autóban!</p><p><br></p><p>Fejezd ki magad, és oszd meg a lelkesedésedet!</p><p>Beépített mikrofon és headset-csatlakozó</p><p>Csevegj barátaiddal online3 a beépített mikrofonnal – vagy csatlakoztass egy headsetet a 3,5 mm-es csatlakozóhoz! Kapcsold be vagy ki a hangrögzítést könnyedén, egy pillanat alatt az ezt szolgáló némítás gombbal!</p><p><br></p><p><strong>Létrehozás gomb</strong></p><p>Rögzítsd és közvetítsd3 emlékezetes játékélményeidet a létrehozás gombbal! A MEGOSZTÁS gomb sikerére építve alkottuk meg a „létrehozás” gombot, amely lehetővé teszi a játékosok számára, hogy még változatosabban hozzanak létre játéktartalmakat, és osszák meg kalandjaikat élőben a világgal.</p><p><br></p><p><br></p><p><strong><em>Egy legendás játékvezérlőt tartasz a kezedben</em></strong></p><p><br></p><p><strong>Jól ismert kényelem</strong></p><p>Ragadd meg az irányítást az átdolgozott két árnyalatban játszó kialakítással, amely a jól ismert és intuitív elrendezést ötvözi a továbbfejlesztett karokkal és a forradalmi fénysávval!</p><p><br></p><p><strong>Ismerős funkciók</strong></p><p>A DualSense™ vezeték nélküli vezérlőben a DUALSHOCK®4 több funkciója is megtalálható, amelyeket most a játékok új generációja számára nyújt.</p><p><br></p><p><strong>Beépített akkumulátor</strong></p><p>Töltsd fel a konzolt és játssz, most USB Type-C4 aljzattal!</p><p><br></p><p><strong>Beépített hangszóró</strong></p><p>Egyes játékok esetében új szintre emelik a játékélményt azok a megnövelt minőségű1 hangeffektusok, amelyek egyenesen a vezérlőből szólnak.</p><p><br></p><p><strong>Mozgásérzékelő</strong></p><p>Éld át az intuitív mozgásvezérlő nyújtotta izgalmakat a támogatott játékokban a beépített gyorsulásmérőnek és giroszkópnak köszönhetően!</p><p><br></p><ol><li>A DUALSHOCK®4 vezeték nélküli vezérlővel összehasonlítva.</li><li>Ha a funkciót támogatja a játék.</li><li>Internetkapcsolat és PlayStation™Network-fiók szükséges hozzá. A fiók tulajdonosainak be kell tölteniük a 7. életévüket, és 18 év alatt szülői beleegyezésre van szükség. Részletes feltételek: playstation.com/PSNTerms</li><li>A kábel nem tartozék. A vezérlő csatlakoztatásához vagy töltéséhez használd a PS5™ konzolhoz mellékelt USB-kábelt.</li></ol><p><br></p><p>Mindig frissítsd PS5 rendszerszoftveredet és a vezeték nélküli vezérlő eszközszoftverét a legújabb verzióra!</p><p><br></p><p>A „PlayStation”, a „PlayStation Family” jel, a „PS5” logó, a „PS5”, a „DualSense” és a „DUALSHOCK” a Sony Interactive Entertainment Inc. bejegyzett védjegyei vagy védjegyei. A „SONY” a Sony Corporation bejegyzett védjegye. Az USB Type-C® az USB Implementers Forum bejegyzett védjegye.</p>', 29999, 24, 'http://localhost/webshop/backend/uploads/69ee4c64e711b.jpeg', 5, '2026-04-26 17:33:24');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `sort_order`, `created_at`) VALUES
(1, 1, 'http://localhost/webshop/backend/uploads/69ee473c8a137.jpeg', 1, 0, '2026-04-26 17:11:24'),
(2, 1, 'http://localhost/webshop/backend/uploads/69ee473c8b58a.jpeg', 0, 1, '2026-04-26 17:11:24'),
(3, 1, 'http://localhost/webshop/backend/uploads/69ee473c8c600.jpeg', 0, 2, '2026-04-26 17:11:24'),
(4, 1, 'http://localhost/webshop/backend/uploads/69ee473c8da62.jpeg', 0, 3, '2026-04-26 17:11:24'),
(5, 1, 'http://localhost/webshop/backend/uploads/69ee473c8e970.jpeg', 0, 4, '2026-04-26 17:11:24'),
(6, 2, 'http://localhost/webshop/backend/uploads/69ee484b35cce.jpeg', 1, 0, '2026-04-26 17:15:55'),
(7, 2, 'http://localhost/webshop/backend/uploads/69ee484b36b28.jpeg', 0, 1, '2026-04-26 17:15:55'),
(8, 2, 'http://localhost/webshop/backend/uploads/69ee484b37468.jpeg', 0, 2, '2026-04-26 17:15:55'),
(9, 2, 'http://localhost/webshop/backend/uploads/69ee484b3848c.jpeg', 0, 3, '2026-04-26 17:15:55'),
(10, 2, 'http://localhost/webshop/backend/uploads/69ee484b38dd9.jpeg', 0, 4, '2026-04-26 17:15:55'),
(11, 3, 'http://localhost/webshop/backend/uploads/69ee4a0c43b7a.jpeg', 1, 0, '2026-04-26 17:23:24'),
(12, 3, 'http://localhost/webshop/backend/uploads/69ee4a0c45dfe.jpeg', 0, 1, '2026-04-26 17:23:24'),
(13, 3, 'http://localhost/webshop/backend/uploads/69ee4a0c473d5.jpeg', 0, 2, '2026-04-26 17:23:24'),
(14, 3, 'http://localhost/webshop/backend/uploads/69ee4a0c48372.jpeg', 0, 3, '2026-04-26 17:23:24'),
(15, 3, 'http://localhost/webshop/backend/uploads/69ee4a0c4c598.jpeg', 0, 4, '2026-04-26 17:23:24'),
(16, 3, 'http://localhost/webshop/backend/uploads/69ee4a0c4e306.jpeg', 0, 5, '2026-04-26 17:23:24'),
(17, 4, 'http://localhost/webshop/backend/uploads/69ee4abef1384.jpeg', 1, 0, '2026-04-26 17:26:22'),
(18, 4, 'http://localhost/webshop/backend/uploads/69ee4abf019b6.jpeg', 0, 1, '2026-04-26 17:26:23'),
(19, 4, 'http://localhost/webshop/backend/uploads/69ee4abf02987.jpeg', 0, 2, '2026-04-26 17:26:23'),
(20, 4, 'http://localhost/webshop/backend/uploads/69ee4abf037de.jpeg', 0, 3, '2026-04-26 17:26:23'),
(21, 4, 'http://localhost/webshop/backend/uploads/69ee4abf056af.jpeg', 0, 4, '2026-04-26 17:26:23'),
(22, 4, 'http://localhost/webshop/backend/uploads/69ee4abf06631.jpeg', 0, 5, '2026-04-26 17:26:23'),
(23, 5, 'http://localhost/webshop/backend/uploads/69ee4b9bc5397.jpeg', 1, 0, '2026-04-26 17:30:03'),
(24, 5, 'http://localhost/webshop/backend/uploads/69ee4b9bc785b.jpeg', 0, 1, '2026-04-26 17:30:03'),
(25, 5, 'http://localhost/webshop/backend/uploads/69ee4b9bca27b.jpeg', 0, 2, '2026-04-26 17:30:03'),
(26, 5, 'http://localhost/webshop/backend/uploads/69ee4b9bcbf1e.jpeg', 0, 3, '2026-04-26 17:30:03'),
(27, 6, 'http://localhost/webshop/backend/uploads/69ee4c64e711b.jpeg', 1, 0, '2026-04-26 17:33:24'),
(28, 6, 'http://localhost/webshop/backend/uploads/69ee4c64e8267.jpeg', 0, 1, '2026-04-26 17:33:24'),
(29, 6, 'http://localhost/webshop/backend/uploads/69ee4c64e9669.jpeg', 0, 2, '2026-04-26 17:33:24'),
(30, 6, 'http://localhost/webshop/backend/uploads/69ee4c64ea49c.jpeg', 0, 3, '2026-04-26 17:33:24');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `is_admin`, `created_at`) VALUES
(1, 'Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2026-04-26 17:08:23');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- A tábla indexei `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- A tábla indexei `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- A tábla indexei `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Megkötések a táblához `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
