# -*- coding: utf-8 -*-
"""
Genera los iconos de la aplicación (AirChef) a partir del mismo diseño que
img/logo.svg: freidora con gorro de chef y dos arcos de aire caliente.

Se dibuja a 8x y se reduce al final, que es la forma barata de conseguir
bordes suaves sin depender de un renderizador de SVG.
"""
import os
from PIL import Image, ImageDraw

OSCURO   = (43, 48, 56)
CAJON    = (32, 36, 43)
BORDE    = (37, 42, 49)
NARANJA  = (255, 140, 26)
NARANJA2 = (255, 157, 46)
GRIS     = (138, 146, 156)
BLANCO   = (255, 255, 255)
CREMA    = (253, 247, 242)
LINEA    = (69, 76, 87)

S = 8  # supermuestreo


def dibujar_logo(lienzo, ox, oy, tam):
    """Pinta el logotipo dentro de un cuadrado de lado `tam` en (ox, oy)."""
    d = ImageDraw.Draw(lienzo)
    u = tam / 100.0                      # una unidad del viewBox original
    def P(x, y):  return (ox + x * u, oy + y * u)
    def caja(x1, y1, x2, y2): return [P(x1, y1), P(x2, y2)]

    # --- Arcos de aire, uno a cada lado -------------------------------
    grosor = max(1, int(round(3.6 * u)))
    arco = caja(20, 23, 80, 83)
    d.arc(arco, 110, 250, fill=NARANJA2, width=grosor)
    d.arc(arco, 290, 430, fill=NARANJA2, width=grosor)

    # --- Gorro de chef -------------------------------------------------
    # Primero la silueta en color de borde y encima la misma en blanco:
    # así el contorno queda unificado sin tener que fusionar las formas.
    def gorro(margen, color):
        m = margen * u
        d.ellipse([P(30, 14)[0] - m, P(30, 14)[1] - m, P(50, 34)[0] + m, P(50, 34)[1] + m], fill=color)
        d.ellipse([P(50, 14)[0] - m, P(50, 14)[1] - m, P(70, 34)[0] + m, P(70, 34)[1] + m], fill=color)
        d.ellipse([P(38, 8)[0] - m,  P(38, 8)[1] - m,  P(62, 32)[0] + m, P(62, 32)[1] + m], fill=color)
        d.rectangle([P(34, 26)[0] - m, P(34, 26)[1] - m, P(66, 33)[0] + m, P(66, 33)[1] + m], fill=color)
        d.rounded_rectangle([P(37, 32)[0] - m, P(37, 32)[1] - m, P(63, 39.5)[0] + m, P(63, 39.5)[1] + m],
                            radius=1.2 * u + m, fill=color)
    gorro(2.4, BORDE)
    gorro(0, BLANCO)

    # --- Cuerpo de la freidora ----------------------------------------
    d.rounded_rectangle(caja(27, 38, 73, 84), radius=7.5 * u, fill=OSCURO)

    # --- Panel: piloto y mando ----------------------------------------
    d.ellipse(caja(48.4, 43.9, 51.6, 47.1), fill=NARANJA2)
    d.ellipse(caja(44.6, 48.6, 55.4, 59.4), outline=GRIS, width=max(1, int(round(1.9 * u))))
    d.line([P(50, 51.5), P(50, 56.5)], fill=NARANJA2, width=max(1, int(round(2.1 * u))))

    # --- Cajón y asa ---------------------------------------------------
    d.rounded_rectangle(caja(29.5, 64, 70.5, 84), radius=6.5 * u, fill=CAJON)
    d.rectangle(caja(29.5, 64, 70.5, 70), fill=CAJON)
    d.line([P(29.5, 64), P(70.5, 64)], fill=LINEA, width=max(1, int(round(1.3 * u))))
    d.rounded_rectangle(caja(45.5, 63, 54.5, 80), radius=4.5 * u,
                        fill=NARANJA, outline=BLANCO, width=max(1, int(round(1.6 * u))))

    # --- Patas ----------------------------------------------------------
    d.rounded_rectangle(caja(33, 83.5, 40, 87), radius=1.7 * u, fill=OSCURO)
    d.rounded_rectangle(caja(60, 83.5, 67, 87), radius=1.7 * u, fill=OSCURO)


def icono(lado, fondo, ocupacion, destino):
    grande = lado * S
    im = Image.new('RGB', (grande, grande), fondo)
    tam = grande * ocupacion
    off = (grande - tam) / 2
    dibujar_logo(im, off, off, tam)
    im = im.resize((lado, lado), Image.LANCZOS)
    im.save(destino, 'PNG', optimize=True)
    return os.path.getsize(destino)


os.makedirs('icons', exist_ok=True)
salidas = [
    ('icons/icon-192.png',         192, CREMA,             0.86),
    ('icons/icon-512.png',         512, CREMA,             0.86),
    # El maskable puede recortarse en círculo: el dibujo va más pequeño.
    ('icons/icon-maskable.png',    512, CREMA,             0.58),
    ('icons/apple-touch-icon.png', 180, CREMA,             0.86),
]
for ruta, lado, fondo, ocup in salidas:
    peso = icono(lado, fondo, ocup, ruta)
    print('%-28s %dx%d  %5.1f KB' % (ruta, lado, lado, peso / 1024.0))
